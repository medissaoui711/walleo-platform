export interface Campaign {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  stamps_required: number;
  reward_description: string;
  reward_description_ar: string;
  scans_count: number;
  rewards_claimed: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Coupon {
  id: string;
  campaign_id: number;
  merchant_name: string;
  merchant_logo: string;
  stamps_collected: number;
  stamps_required: number;
  is_reward_unlocked: boolean;
  reward_description: string;
  earned_at?: string;
}

export interface ScanActivity {
  id: number;
  campaign_id: number;
  campaign_title: string;
  customer_id: string;
  timestamp: string;
  stamps_incremented: number;
  status: 'offline_cached' | 'synced';
}

export interface DatabaseState {
  campaigns: Campaign[];
  scans: ScanActivity[];
  coupons: Coupon[];
  support_tickets: {
    id: number;
    subject: string;
    message: string;
    status: string;
    created_at: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
