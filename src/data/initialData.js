// src/data/initialData.js
import { todayISO } from '../utils/dateUtils';

// Default expense categories matching Luna's design
export const DEFAULT_CATEGORIES = [
  {
    id: 'cat_eating_out',
    name: 'Eating out',
    icon: '🍽️',
    color: '#FF2D78',
    budget: 0,
    spent: 0,
    cycle: 'weekly',
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#F59E0B',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_gas',
    name: 'Gas',
    icon: '⛽',
    color: '#22C55E',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#EF4444',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_internet',
    name: 'Internet',
    icon: '🌐',
    color: '#FF2D78',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_medicine',
    name: 'Medicine',
    icon: '💊',
    color: '#F59E0B',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_personal_care',
    name: 'Personal Care',
    icon: '🧴',
    color: '#22C55E',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_phone',
    name: 'Phone Bill',
    icon: '📱',
    color: '#3B82F6',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_transport',
    name: 'Public Transport',
    icon: '🚇',
    color: '#3B82F6',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_rent',
    name: 'Rent',
    icon: '🏠',
    color: '#6B7280',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
  },
  {
    id: 'cat_savings',
    name: 'Savings',
    icon: '🏦',
    color: '#16A34A',
    budget: 0,
    spent: 0,
    cycle: 'monthly',
    type: 'savings',
  },
];

// Onboarding category suggestions grouped by section (like Luna)
export const ONBOARDING_CAT_GROUPS = [
  {
    label: 'Maison & Alimentation',
    items: [
      { name: 'Loyer/Prêt', icon: '🏠', color: '#8B5CF6', cycle: 'monthly' },
      { name: 'Courses', icon: '🛒', color: '#10B981', cycle: 'monthly' },
      { name: 'Restaurant', icon: '🍕', color: '#F59E0B', cycle: 'monthly' },
      { name: 'Factures', icon: '⚡', color: '#EF4444', cycle: 'monthly' },
    ],
  },
  {
    label: 'Mobilité & Voyage',
    items: [
      { name: 'Transport', icon: '🚆', color: '#3B82F6', cycle: 'monthly' },
      { name: 'Carburant', icon: '⛽', color: '#6366F1', cycle: 'monthly' },
      { name: 'Voyage', icon: '✈️', color: '#14B8A6', cycle: 'monthly' },
    ],
  },
  {
    label: 'Loisirs & Style de vie',
    items: [
      { name: 'Sorties', icon: '🎬', color: '#EC4899', cycle: 'monthly' },
      { name: 'Abonnements', icon: '📱', color: '#8B5CF6', cycle: 'monthly' },
      { name: 'Shopping', icon: '👕', color: '#F97316', cycle: 'monthly' },
      { name: 'Sport', icon: '💪', color: '#06B6D4', cycle: 'monthly' },
    ],
  },
  {
    label: 'Finance & Bien-être',
    items: [
      { name: 'Santé', icon: '🏥', color: '#EF4444', cycle: 'monthly' },
      { name: 'Épargne', icon: '📈', color: '#10B981', cycle: 'monthly' },
      { name: 'Imprévus', icon: '🆘', color: '#F59E0B', cycle: 'monthly' },
      { name: 'Cadeaux', icon: '🎁', color: '#EC4899', cycle: 'monthly' },
    ],
  },
];

// Quick-add popular subscriptions
export const QUICK_SUBSCRIPTIONS = [
  { name: 'Netflix', icon: '🎬', logo: 'https://logo.clearbit.com/netflix.com', color: '#E50914', amount: 15.99, cycle: 'monthly', category: 'Streaming' },
  { name: 'Spotify', icon: '🎵', logo: 'https://logo.clearbit.com/spotify.com', color: '#1DB954', amount: 9.99, cycle: 'monthly', category: 'Musique' },
  { name: 'Disney+', icon: '🏰', logo: 'https://logo.clearbit.com/disneyplus.com', color: '#113CCF', amount: 8.99, cycle: 'monthly', category: 'Streaming' },
  { name: 'Apple TV+', icon: '🍎', logo: 'https://logo.clearbit.com/apple.com', color: '#000000', amount: 4.99, cycle: 'monthly', category: 'Streaming' },
  { name: 'YouTube Premium', icon: '▶️', logo: 'https://logo.clearbit.com/youtube.com', color: '#FF0000', amount: 11.99, cycle: 'monthly', category: 'Streaming' },
  { name: 'Amazon Prime', icon: '📦', logo: 'https://logo.clearbit.com/amazon.com', color: '#FF9900', amount: 69.99, cycle: 'annual', category: 'Shopping' },
  { name: 'Adobe CC', icon: '🎨', logo: 'https://logo.clearbit.com/adobe.com', color: '#FF0000', amount: 59.99, cycle: 'monthly', category: 'Productivité' },
  { name: 'Microsoft 365', icon: '🖥️', logo: 'https://logo.clearbit.com/microsoft.com', color: '#0078D4', amount: 6.99, cycle: 'monthly', category: 'Productivité' },
  { name: 'iCloud+', icon: '☁️', logo: 'https://logo.clearbit.com/icloud.com', color: '#0A84FF', amount: 0.99, cycle: 'monthly', category: 'Stockage' },
  { name: 'Google One', icon: '🔵', logo: 'https://logo.clearbit.com/google.com', color: '#4285F4', amount: 1.99, cycle: 'monthly', category: 'Stockage' },
  { name: 'Deezer', icon: '🎶', logo: 'https://logo.clearbit.com/deezer.com', color: '#FF0092', amount: 9.99, cycle: 'monthly', category: 'Musique' },
  { name: 'Canal+', icon: '📺', logo: 'https://logo.clearbit.com/canal-plus.com', color: '#000000', amount: 24.99, cycle: 'monthly', category: 'Streaming' },
  { name: 'Notion', icon: '📝', logo: 'https://logo.clearbit.com/notion.so', color: '#000000', amount: 8.00, cycle: 'monthly', category: 'Productivité' },
  { name: 'Dropbox', icon: '📁', logo: 'https://logo.clearbit.com/dropbox.com', color: '#0061FF', amount: 9.99, cycle: 'monthly', category: 'Stockage' },
  { name: 'NordVPN', icon: '🔒', logo: 'https://logo.clearbit.com/nordvpn.com', color: '#4687FF', amount: 4.49, cycle: 'monthly', category: 'Sécurité' },
  { name: 'ChatGPT Plus', icon: '🤖', logo: 'https://logo.clearbit.com/openai.com', color: '#10A37F', amount: 20.00, cycle: 'monthly', category: 'IA' },
];

// Default subscription categories
export const SUB_CATEGORIES = ['Streaming', 'Musique', 'Stockage', 'Productivité', 'Santé & Sport', 'Sécurité', 'IA', 'Shopping', 'Autre'];

// Color palette for category creation (like Luna)
export const CATEGORY_COLORS = [
  '#EF4444', '#FF2D78', '#EC4899', '#A855F7', '#5B3BF5',
  '#3B82F6', '#06B6D4', '#22C55E', '#84CC16', '#F59E0B',
  '#F97316', '#6B7280', '#0F172A',
];

// Default app state
export const DEFAULT_APP_STATE = {
  onboardingComplete: false,
  income: 0,
  incomeCycle: 'monthly',
  currency: '€',
  notifLevel: 1, // 0=off, 1=gentle, 2=aggressive, 3=relentless
  trial: {
    active: true,
    startDate: todayISO(),
    durationDays: 14,
    endDate: (() => {
      const end = new Date(todayISO());
      end.setDate(end.getDate() + 14);
      return end.toISOString();
    })(),
  },
  subscription: null, // null = free/trial, 'monthly'|'annual'|'lifetime'
  features: {
    budgeting: true,
    incomeTracking: true,
    reports: true,
    rounding: false,
    faceId: false,
    passcode: false,
    pin: null,
  },
};
