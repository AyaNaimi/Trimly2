// src/utils/dateUtils.js
// Handles ALL date edge cases: leap years, free trials, different cycles

/**
 * Check if a year is a leap year
 * A year is a leap year if:
 * - divisible by 4 AND
 * - NOT divisible by 100, OR divisible by 400
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get days in a specific month of a year
 * Handles February in leap years (29 days) vs non-leap years (28 days)
 */
export function daysInMonth(year, month) { // month is 0-indexed
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month];
}

/**
 * Safely add months to a date, handling month-end edge cases
 * e.g., Jan 31 + 1 month = Feb 28 (or 29 in leap year), NOT March 2
 * e.g., Feb 29 (leap year) + 12 months = Feb 28 (non-leap year)
 */
export function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  
  // If the day changed, it means we overflowed into next month
  // e.g., Jan 31 + 1 = Mar 2 (overflow) → should be Feb 28/29
  if (d.getDate() !== originalDay) {
    d.setDate(0); // Set to last day of previous month
  }
  return d;
}

/**
 * Safely add years to a date
 * Handles Feb 29 → Feb 28 in non-leap target years
 */
export function addYears(date, years) {
  const d = new Date(date);
  const month = d.getMonth();
  const day = d.getDate();
  d.setFullYear(d.getFullYear() + years);
  
  // Handle Feb 29 → Feb 28 in non-leap year
  if (month === 1 && day === 29 && !isLeapYear(d.getFullYear())) {
    d.setDate(28);
  }
  return d;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Advance a date by one billing cycle
 */
export function advanceByCycle(date, cycle) {
  switch (cycle) {
    case 'weekly': return addWeeks(date, 1);
    case 'monthly': return addMonths(date, 1);
    case 'quarterly': return addMonths(date, 3);
    case 'annual': return addYears(date, 1);
    default: return addMonths(date, 1);
  }
}

/**
 * Calculate the next billing date for a subscription
 * Handles:
 * - Free trial periods (returns trial info if still in trial)
 * - All cycle types (weekly, monthly, quarterly, annual)
 * - Leap year edge cases
 * - Feb 29 subscriptions
 */
/**
 * Calculate the next billing date for a subscription
 */
export function getNextBilling(subscription, locale = 'en', t) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(subscription.startDate);
  startDate.setHours(0, 0, 0, 0);

  // ── FREE TRIAL HANDLING ──
  if (subscription.trialDays > 0) {
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + subscription.trialDays);
    trialEndDate.setHours(0, 0, 0, 0);
    
    if (today <= trialEndDate) {
      const daysLeft = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24));
      
      let label = '';
      if (t) {
        if (daysLeft === 1) {
          label = t('home.trial.endsTomorrow') || 'Ends tomorrow';
        } else if (daysLeft === 0) {
          label = t('home.trial.endsToday') || 'Ends today';
        } else {
          label = t('home.trial.daysLeft', { days: daysLeft });
        }
      } else {
        const isFr = locale.startsWith('fr');
        if (daysLeft === 1) label = isFr ? 'Essai se termine demain !' : 'Ends tomorrow';
        else if (daysLeft === 0) label = isFr ? "Essai se termine aujourd'hui !" : 'Ends today';
        else label = isFr ? `Essai: ${daysLeft}j restants` : `Trial: ${daysLeft}d left`;
      }

      return {
        isTrial: true,
        trialEndsAt: trialEndDate,
        trialDaysLeft: daysLeft,
        nextChargeDate: trialEndDate,
        nextChargeAmount: subscription.amount,
        daysUntilCharge: daysLeft,
        urgency: daysLeft <= 2 ? 'urgent' : daysLeft <= 7 ? 'soon' : 'trial',
        label: label,
      };
    }
    
    let nextDate = new Date(trialEndDate);
    while (nextDate <= today) {
      nextDate = advanceByCycle(nextDate, subscription.cycle);
    }
    const days = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    return buildBillingResult(nextDate, days, subscription.amount, false, locale, t);
  }

  // ── REGULAR BILLING ──
  let nextDate = new Date(startDate);
  if (nextDate > today) {
    const days = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    return buildBillingResult(nextDate, days, subscription.amount, false, locale, t);
  }
  
  let safety = 0;
  while (nextDate <= today && safety < 200) {
    nextDate = advanceByCycle(nextDate, subscription.cycle);
    safety++;
  }

  const days = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  return buildBillingResult(nextDate, days, subscription.amount, false, locale, t);
}

function buildBillingResult(date, daysUntil, amount, isTrial, locale = 'en', t) {
  const urgency = daysUntil <= 0 ? 'today' : daysUntil <= 2 ? 'urgent' : daysUntil <= 7 ? 'soon' : 'ok';
  let label = '';
  
  if (t) {
    if (daysUntil <= 0) label = t('common.today');
    else if (daysUntil === 1) label = t('common.tomorrow') || 'Tomorrow';
    else if (daysUntil <= 7) label = t('subscriptions.inDays', { days: daysUntil }) || `In ${daysUntil} days`;
    else label = formatDate(date, locale);
  } else {
    const isFr = locale.startsWith('fr');
    if (daysUntil <= 0) label = isFr ? "Aujourd'hui !" : "Today!";
    else if (daysUntil === 1) label = isFr ? 'Demain' : 'Tomorrow';
    else if (daysUntil <= 7) label = isFr ? `Dans ${daysUntil} jours` : `In ${daysUntil} days`;
    else label = formatDate(date, locale);
  }
  
  return { isTrial, nextChargeDate: date, nextChargeAmount: amount, daysUntilCharge: daysUntil, urgency, label };
}

/**
 * Generate 12-month billing projection for Death Chart
 */
export function generate12MonthProjection(subscriptions, locale = 'en', t) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + i);
    d.setDate(1);
    return { 
      label: d.toLocaleDateString(locale, { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0,
    };
  });

  subscriptions
    .filter(s => s.active)
    .forEach(sub => {
      const billing = getNextBilling(sub, locale, t);
      let cursor = new Date(billing.nextChargeDate);
      cursor.setHours(0, 0, 0, 0);
      
      let safety = 0;
      while (safety++ < 200) {
        const diffMonths = 
          (cursor.getFullYear() - today.getFullYear()) * 12 + 
          (cursor.getMonth() - today.getMonth());
        
        if (diffMonths >= 12) break;
        if (diffMonths >= 0) {
          months[diffMonths].total += billing.isTrial ? 0 : sub.amount;
        }
        
        cursor = advanceByCycle(cursor, sub.cycle);
      }
    });

  return months;
}

/**
 * Get the "period" date range label (weekly or monthly)
 */
export function getPeriodLabel(period, locale = 'en', t) {
  const now = new Date();
  if (period === 'monthly') {
    return now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  const weeks = getWeeksInMonth();
  const week = weeks.find(w => w.id === period) || weeks[0];
  
  if (period === 'weekly' || !week) {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return `${mon.getDate()} – ${sun.getDate()} ${sun.toLocaleDateString(locale, { month: 'short' })}`;
  }

  const validDays = week.days.filter(d => d.isCurrentMonth);
  const startDay = validDays[0].day;
  const endDay = validDays[validDays.length - 1].day;

  const weekPrefix = t ? t('reports.weekShort') : (locale.startsWith('fr') ? 'S' : 'W');
  return `${weekPrefix}${week.weekNumber}: ${startDay} – ${endDay} ${now.toLocaleDateString(locale, { month: 'short' })}`;
}

/**
 * Days remaining in current period
 */
export function daysLeftInPeriod(period) {
  const now = new Date();
  if (period === 'weekly') {
    const day = now.getDay();
    return day === 0 ? 0 : 7 - day;
  } else {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return lastDay - now.getDate();
  }
}

/**
 * Format a date for display
 */
export function formatDate(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export function formatDateFull(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatMonthYear(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatWeekRange(date, locale = 'en') {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString(locale, { month: 'short', year: 'numeric' })}`;
  }
  return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/**
 * Check if a date is Feb 29
 */
export function isLeapDaySubscription(dateString) {
  const d = new Date(dateString);
  return d.getMonth() === 1 && d.getDate() === 29;
}

/**
 * Get the notification message for an upcoming subscription
 */
export function getNotificationMessage(sub, daysUntil, locale = 'en', t, currency = 'EUR') {
  const billing = getNextBilling(sub, locale, t);
  const amount = Number(billing.nextChargeAmount ?? sub.amount ?? 0).toFixed(2);
  const isFr = String(locale || '').startsWith('fr');
  const tr = (key, fallback, options = {}) => {
    if (typeof t !== 'function') return fallback;
    const value = t(key, options);
    return !value || value === key ? fallback : value;
  };
  
  const cycle = tr(`subscriptions.cycles.${sub.cycle}`, sub.cycle);
  const targetDate = formatDateFull(billing.nextChargeDate, locale);

  if (billing.isTrial) {
    if (daysUntil <= 0) {
      return {
        title: tr('notifications.trialEndingTodayTitle', isFr ? `${sub.name} : essai termine aujourd'hui` : `${sub.name} ends trial today`, { name: sub.name }),
        body: tr('notifications.trialEndingTodayBody', isFr ? `L'essai se termine aujourd'hui. Ensuite ${amount} ${currency} ${cycle}.` : `Trial ends today. Then ${amount} ${currency} ${cycle}.`, { amount, currency, cycle }),
      };
    }

    return {
      title: tr('notifications.trialEndingSoonTitle', isFr ? `${sub.name} : essai dans ${daysUntil}j` : `${sub.name} trial ends in ${daysUntil} days`, { name: sub.name, days: daysUntil }),
      body: tr('notifications.trialEndingSoonBody', isFr ? `Essai gratuit jusqu'au ${targetDate}, puis ${amount} ${currency} ${cycle}.` : `Free trial until ${targetDate}, then ${amount} ${currency} ${cycle}.`, { date: targetDate, amount, currency, cycle }),
    };
  }

  if (daysUntil <= 0) {
    return {
      title: tr('notifications.paymentTodayTitle', isFr ? `${sub.name} aujourd'hui` : `${sub.name} today`, { name: sub.name }),
      body: tr('notifications.paymentTodayBody', isFr ? `Prelevement prevu aujourd'hui (${targetDate}) : ${amount} ${currency}, cycle ${cycle}.` : `Charge scheduled today (${targetDate}): ${amount} ${currency}, ${cycle} cycle.`, { date: targetDate, amount, currency, cycle }),
    };
  }

  if (daysUntil === 1) {
    return {
      title: tr('notifications.paymentTomorrowTitle', isFr ? `${sub.name} demain` : `${sub.name} tomorrow`, { name: sub.name }),
      body: tr('notifications.paymentTomorrowBody', isFr ? `Rappel : ${amount} ${currency} sera preleve demain (${targetDate}), abonnement ${cycle}.` : `Reminder: ${amount} ${currency} will be charged tomorrow (${targetDate}), ${cycle} subscription.`, { date: targetDate, amount, currency, cycle }),
    };
  }

  return {
    title: tr('notifications.paymentUpcomingTitle', isFr ? `${sub.name} dans ${daysUntil}j` : `${sub.name} in ${daysUntil} days`, { name: sub.name, days: daysUntil }),
    body: tr('notifications.paymentUpcomingBody', isFr ? `Prelevement prevu le ${targetDate} : ${amount} ${currency}, abonnement ${cycle}.` : `Charge scheduled on ${targetDate}: ${amount} ${currency}, ${cycle} subscription.`, { date: targetDate, amount, currency, cycle }),
  };
}

/**
 * Trial expiry warning
 */
export function getTrialWarning(sub, locale = 'en', t) {
  const billing = getNextBilling(sub, locale, t);
  if (!billing.isTrial) return null;
  if (billing.trialDaysLeft <= 3) {
    return t 
      ? t('subscriptions.detail.trialEndingWarning', { days: billing.trialDaysLeft })
      : `⏰ Free trial ends in ${billing.trialDaysLeft} days!`;
  }
  return null;
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = '€') {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k${currency}`;
  }
  return `${amount.toFixed(2)}${currency}`;
}

export function formatCurrencyShort(amount, currency = '€') {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Compute annual equivalent of any cycle
 */
export function annualEquivalent(amount, cycle) {
  switch (cycle) {
    case 'weekly': return amount * 52;
    case 'monthly': return amount * 12;
    case 'quarterly': return amount * 4;
    case 'annual': return amount;
    default: return amount * 12;
  }
}

/**
 * Compute monthly equivalent of any cycle
 */
export function monthlyEquivalent(amount, cycle) {
  switch (cycle) {
    case 'weekly': return (amount * 52) / 12;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    default: return amount;
  }
}

/**
 * Get today's ISO string for default date inputs
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Budget period multiplier
 */
export function weeklyBudgetForCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = daysInMonth(year, month);
  return totalDays / 7;
}

/**
 * Returns an array of week objects for the current month.
 */
export function getWeeksInMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = daysInMonth(year, month);
  
  const weeks = [];
  let dayCounter = 1;
  let weekNum = 1;
  
  const firstWeekDays = [];
  for (let i = 0; i < 7; i++) {
    if (i < adjustedFirstDay) {
      firstWeekDays.push({ day: null, isCurrentMonth: false });
    } else {
      firstWeekDays.push({ day: dayCounter++, isCurrentMonth: true });
    }
  }
  weeks.push({ id: `w${weekNum++}`, days: firstWeekDays, weekNumber: 1 });
  
  while (dayCounter <= totalDays) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      if (dayCounter <= totalDays) {
        weekDays.push({ day: dayCounter++, isCurrentMonth: true });
      } else {
        weekDays.push({ day: null, isCurrentMonth: false });
      }
    }
    weeks.push({ id: `w${weekNum++}`, days: weekDays, weekNumber: weeks.length + 1 });
  }
  
  return weeks;
}

/**
 * Returns { start: Date, end: Date } for a given period ID
 */
export function getPeriodRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (period === 'monthly') {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month, daysInMonth(year, month), 23, 59, 59)
    };
  }

  const weeks = getWeeksInMonth();
  const week = weeks.find(w => w.id === period) || weeks[0];
  
  const validDays = week.days.filter(d => d.isCurrentMonth);
  const startDay = validDays[0].day;
  const endDay = validDays[validDays.length - 1].day;
  
  return {
    start: new Date(year, month, startDay),
    end: new Date(year, month, endDay, 23, 59, 59)
  };
}
