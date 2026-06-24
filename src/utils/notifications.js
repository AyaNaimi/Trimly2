// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getNextBilling, getNotificationMessage } from './dateUtils';

const FALLBACK_NOTIFICATIONS = {
  appName: 'Trimly',
  reminders: [
    'Ajoutez vos depenses du jour pour garder votre budget a jour.',
    'Petit point budget : verifiez vos categories avant ce soir.',
    'Pensez a enregistrer vos mouvements recents.',
    'Quelques entrees sont peut-etre en attente dans votre budget.',
  ],
  cancellationTitle: 'Suivi de resiliation',
  cancellationBody: (name) => `Verifiez que ${name || 'cet abonnement'} est bien resilie.`,
};

function safeTranslate(t, key, fallback, options = {}) {
  if (typeof t !== 'function') return typeof fallback === 'function' ? fallback(options) : fallback;
  const value = t(key, options);
  if (!value || value === key) return typeof fallback === 'function' ? fallback(options) : fallback;
  return value;
}

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled() {
  if (!Device.isDevice) {
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Request notification permissions
 * Returns true if granted
 */
export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    // Simulator/emulator - permissions won't work
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('subscriptions', {
      name: 'Prelevements',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5B3BF5',
    });
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Rappels budget',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return finalStatus === 'granted';
}

/**
 * Schedule all subscription notifications
 * For each active subscription, schedules alerts at:
 * - 2 days before charge
 * - 1 day before charge  
 * - Day of charge
 * Also handles trial end notifications
 */
export async function scheduleAllSubscriptionNotifications(subscriptions, locale = 'en', t) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith('sub-')) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  if (!subscriptions || subscriptions.length === 0) return;

  const granted = await requestNotificationPermissions();
  if (!granted) {
    console.log('Notification permissions not granted, skipping subscription notifications');
    return;
  }

  for (const sub of subscriptions) {
    if (!sub.active) continue;

    const billing = getNextBilling(sub, locale, t);

    // Schedule for 2 days before
    if (billing.daysUntilCharge >= 2) {
      const triggerDate = new Date(billing.nextChargeDate);
      triggerDate.setDate(triggerDate.getDate() - 2);
      triggerDate.setHours(9, 0, 0, 0); // 9am

      if (triggerDate > new Date()) {
        const msg = getNotificationMessage(sub, 2, locale, t);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: msg.title,
            body: msg.body,
            data: { subscriptionId: sub.id, type: 'upcoming' },
            categoryIdentifier: 'subscriptions',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'subscriptions',
          },
          identifier: `sub-${sub.id}-2days`,
        });
      }
    }

    // Schedule for 1 day before
    if (billing.daysUntilCharge >= 1) {
      const triggerDate = new Date(billing.nextChargeDate);
      triggerDate.setDate(triggerDate.getDate() - 1);
      triggerDate.setHours(9, 0, 0, 0);

      if (triggerDate > new Date()) {
        const msg = getNotificationMessage(sub, 1, locale, t);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: msg.title,
            body: msg.body,
            data: { subscriptionId: sub.id, type: 'tomorrow' },
            categoryIdentifier: 'subscriptions',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'subscriptions',
          },
          identifier: `sub-${sub.id}-1day`,
        });
      }
    }

    // Schedule for day of charge
    {
      const triggerDate = new Date(billing.nextChargeDate);
      triggerDate.setHours(9, 0, 0, 0);
      if (triggerDate > new Date()) {
        const msg = getNotificationMessage(sub, 0, locale, t);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: msg.title,
            body: msg.body,
            data: { subscriptionId: sub.id, type: 'today' },
            categoryIdentifier: 'subscriptions',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'subscriptions',
          },
          identifier: `sub-${sub.id}-today`,
        });
      }
    }

    // Trial ending soon notification (3 days before trial ends)
    if (billing.isTrial && billing.trialDaysLeft <= 7) {
      const triggerDate = new Date(billing.trialEndsAt);
      triggerDate.setDate(triggerDate.getDate() - 3);
      triggerDate.setHours(10, 0, 0, 0);

      if (triggerDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: safeTranslate(t, 'notifications.trialEndingTitle', `${sub.name} : essai bientot termine`, { name: sub.name }),
            body: safeTranslate(t, 'notifications.trialEndingBody', `Votre essai se termine bientot. Ensuite ${sub.amount.toFixed(2)} ${sub.currency || 'EUR'} sera facture.`, { 
              days: 3, 
              amount: sub.amount.toFixed(2), 
              currency: sub.currency || '€',
              cycle: safeTranslate(t, `subscriptions.cycles.${sub.cycle}Full`, sub.cycle).toLowerCase() 
            }),
            data: { subscriptionId: sub.id, type: 'trial-ending' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: 'subscriptions',
          },
          identifier: `sub-${sub.id}-trial`,
        });
      }
    }
  }
}

export async function scheduleAppAccessNotifications({ trial, subscriptionPlan, proCurrentPeriodEnd, currency } = {}, locale = 'en') {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith('access-')) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  const hasTrialTarget = !subscriptionPlan && trial?.active;
  const hasProTarget = !!subscriptionPlan && !!proCurrentPeriodEnd;
  if (!hasTrialTarget && !hasProTarget) return [];

  const granted = await requestNotificationPermissions();
  if (!granted) return [];

  const isFr = String(locale || '').startsWith('fr');
  const now = new Date();
  const scheduledIds = [];

  const scheduleDateNotification = async (identifier, date, title, body) => {
    if (!date || Number.isNaN(date.getTime()) || date <= now) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'app-access', identifier },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: 'reminders',
      },
      identifier,
    });
    scheduledIds.push(identifier);
  };

  if (!subscriptionPlan && trial?.active) {
    const trialEnd = trial.endDate
      ? new Date(trial.endDate)
      : trial.startDate
        ? new Date(trial.startDate)
        : null;
    if (trialEnd && !trial.endDate) {
      trialEnd.setDate(trialEnd.getDate() + (trial.durationDays || 14));
    }

    if (trialEnd) {
      const beforeTrialEnd = new Date(trialEnd);
      beforeTrialEnd.setDate(beforeTrialEnd.getDate() - 2);
      beforeTrialEnd.setHours(10, 0, 0, 0);

      const trialEndMorning = new Date(trialEnd);
      trialEndMorning.setHours(10, 0, 0, 0);

      await scheduleDateNotification(
        'access-trial-2days',
        beforeTrialEnd,
        isFr ? 'Votre essai Trimly se termine bientot' : 'Your Trimly trial ends soon',
        isFr
          ? 'Passez a Trimly Pro pour garder le scan email, les categories et les ajouts illimites.'
          : 'Upgrade to Trimly Pro to keep email scan, categories and unlimited entries.',
      );
      await scheduleDateNotification(
        'access-trial-end',
        trialEndMorning,
        isFr ? 'Essai Trimly termine aujourd hui' : 'Trimly trial ends today',
        isFr
          ? 'Les actions essentielles demanderont maintenant un plan Pro.'
          : 'Essential actions now require a Pro plan.',
      );
    }
  }

  if (subscriptionPlan && proCurrentPeriodEnd) {
    const periodEnd = new Date(proCurrentPeriodEnd);
    const renewalReminder = new Date(periodEnd);
    renewalReminder.setDate(renewalReminder.getDate() - 3);
    renewalReminder.setHours(10, 0, 0, 0);

    await scheduleDateNotification(
      'access-pro-renewal',
      renewalReminder,
      isFr ? 'Renouvellement Trimly Pro' : 'Trimly Pro renewal',
      isFr
        ? `Votre plan ${subscriptionPlan} arrive a echeance bientot. Verifiez votre moyen de paiement.`
        : `Your ${subscriptionPlan} plan renews soon. Check your payment method.`,
    );
  }

  return scheduledIds;
}

/**
 * Schedule daily spending reminder based on user's notification level
 * 0 = off, 1 = gentle (1x/day), 2 = aggressive (3x/day), 3 = relentless (6x/day)
 */
export async function scheduleDailyReminders(level, t) {
  // Cancel existing reminders
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith('reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // If level is 0 or notifications not enabled, return early
  if (level === 0) return;

  const enabled = await areNotificationsEnabled();
  if (!enabled) {
    console.log('Notifications not enabled, skipping daily reminders');
    return;
  }

  const messages = [
    safeTranslate(t, 'notifications.reminders.journal', FALLBACK_NOTIFICATIONS.reminders[0]),
    safeTranslate(t, 'notifications.reminders.budgetPoint', FALLBACK_NOTIFICATIONS.reminders[1]),
    safeTranslate(t, 'notifications.reminders.updateMovements', FALLBACK_NOTIFICATIONS.reminders[2]),
    safeTranslate(t, 'notifications.reminders.pendingEntries', FALLBACK_NOTIFICATIONS.reminders[3]),
  ];

  const times = [
    level >= 1 ? [12, 0] : null,
    level >= 2 ? [18, 0] : null,
    level >= 2 ? [21, 0] : null,
    level >= 3 ? [8, 0] : null,
    level >= 3 ? [15, 0] : null,
    level >= 3 ? [20, 0] : null,
  ].filter(Boolean);

  for (let i = 0; i < times.length; i++) {
    const [hour, minute] = times[i];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: safeTranslate(t, 'common.appName', FALLBACK_NOTIFICATIONS.appName),
        body: messages[i % messages.length],
        data: { type: 'reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'reminders',
      },
      identifier: `reminder-${hour}-${minute}`,
    });
  }
}

export async function scheduleCancellationFollowUps(subscription, reminders = [], t) {
  const granted = await requestNotificationPermissions();
  if (!granted || !subscription?.id) return [];

  const scheduledIds = [];

  for (const reminder of reminders) {
    let triggerDate = reminder.date ? new Date(reminder.date) : new Date();
    if (!reminder.date) {
      triggerDate.setDate(triggerDate.getDate() + (reminder.daysFromNow || 1));
      triggerDate.setHours(10, 0, 0, 0);
    }

    if (Number.isNaN(triggerDate.getTime()) || triggerDate <= new Date()) {
      continue;
    }

    const identifier = `cancel-${subscription.id}-${reminder.key}`;
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title || safeTranslate(t, 'notifications.cancellation.title', FALLBACK_NOTIFICATIONS.cancellationTitle),
        body: reminder.body || safeTranslate(
          t,
          'notifications.cancellation.body',
          FALLBACK_NOTIFICATIONS.cancellationBody(subscription.name),
          { name: subscription.name },
        ),
        data: { subscriptionId: subscription.id, type: 'cancellation-follow-up', key: reminder.key },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'reminders',
      },
      identifier,
    });
    scheduledIds.push(identifier);
  }

  return scheduledIds;
}

/**
 * Get push token (for remote notifications)
 */
export async function getPushToken() {
  if (!Device.isDevice) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}
