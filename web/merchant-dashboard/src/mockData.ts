import { Campaign, Coupon, DatabaseState } from './types'

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    title: 'Walleo Coffee Stamp Card',
    title_ar: 'بطاقة ختم قهوة واليو',
    description: 'Buy any coffee 5 times and get your 6th cup completely free!',
    description_ar: 'اشترِ أي قهوة 5 مرات واحصل على الكوب السادس مجاناً بالكامل!',
    stamps_required: 5,
    reward_description: 'Free Premium Coffee of your choice',
    reward_description_ar: 'قهوة مميزة مجانية من اختيارك',
    scans_count: 1420,
    rewards_claimed: 154,
    status: 'active',
    created_at: '2026-05-10T12:00:00Z',
  },
  {
    id: 2,
    title: 'Traditional Dates Box Reward',
    title_ar: 'مكافأة صندوق التمر الفاخر',
    description: 'Collect 5 stamps on boxes purchase to unlock an organic dates gift box.',
    description_ar: 'اجمع 5 أختام عند شراء الصناديق لفتح علبة تمر هدايا عضوية.',
    stamps_required: 5,
    reward_description: 'Luxury Organic Dates Box (1kg)',
    reward_description_ar: 'علبة تمر عضوي فاخرة (1 كجم)',
    scans_count: 520,
    rewards_claimed: 45,
    status: 'active',
    created_at: '2026-05-18T10:00:00Z',
  },
  {
    id: 3,
    title: 'Cold Brew Loyalty Stamp',
    title_ar: 'ختم ولاء القهوة الباردة',
    description: 'Collect 5 stamps on cold specials to unlock a free signature cold brew bottle.',
    description_ar: 'اجمع 5 أختام على المشروبات الباردة الخاصة للحصول على زجاجة من القهوة المبردة المميزة.',
    stamps_required: 5,
    reward_description: 'Free Signature Bottle Cold Brew',
    reward_description_ar: 'زجاجة قهوة باردة مجانية من توقيعنا',
    scans_count: 320,
    rewards_claimed: 22,
    status: 'inactive',
    created_at: '2026-06-01T08:00:00Z',
  },
]

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'wc-user-1',
    campaign_id: 1,
    merchant_name: 'Walleo Coffee Co.',
    merchant_logo: '☕',
    stamps_collected: 3,
    stamps_required: 5,
    is_reward_unlocked: false,
    reward_description: 'Free Premium Coffee of your choice',
  },
  {
    id: 'wc-user-2',
    campaign_id: 2,
    merchant_name: 'Walleo Dates Shop',
    merchant_logo: '🌴',
    stamps_collected: 4,
    stamps_required: 5,
    is_reward_unlocked: false,
    reward_description: 'Luxury Organic Dates Box (1kg)',
  },
]

export const DUMMY_ACTIVITIES = [
  { date: '06/02', scans: 45, points: 225 },
  { date: '06/03', scans: 72, points: 360 },
  { date: '06/04', scans: 61, points: 305 },
  { date: '06/05', scans: 95, points: 475 },
  { date: '06/06', scans: 110, points: 550 },
  { date: '06/07', scans: 125, points: 625 },
  { date: '06/08', scans: 140, points: 700 },
]

export const ARCHITECTURE_GUIDES = [
  {
    title: 'FastAPI SQLAlchemy & Alembic Migrations',
    description: 'How PostgreSQL tables and Alembic schemas are integrated.',
    suggestion: 'Alembic setup instructions',
    code: `# Alembic configuration & migration generation...`
  },
  {
    title: 'Kotlin Android Room Offline Caching & Repositories',
    description: 'Ensure offline scanning using Jetpack Room DB.',
    suggestion: 'Room Room-Database entity setup',
    code: `// Room database for cached scans & stamps...`
  },
  {
    title: 'Jetpack Compose Loyalty UI Scanner Layout',
    description: 'Modern declarative layout containing QR scanner.',
    suggestion: 'Jetpack Compose scanner code',
    code: `// QR Scanner Camera view...`
  },
  {
    title: 'Geofencing Proximity Broadcast Receivers',
    description: 'Configure continuous monitoring using LocationServices.',
    suggestion: 'Geofencing triggers client',
    code: `// Registering proximity geofence...`
  }
]
