import type { User } from '@supabase/supabase-js';

// お客様情報の型定義
export interface Customer {
  id: string;
  name: string;
  created_at: string;
}

// メッセージ履歴の型定義
export interface MessageHistory {
  id: string;
  customer_id?: string;
  customer_name: string;
  what_happened: string;
  message_type: string;
  tone: string;
  generated_message: string;
  created_at: string;
}

// 統計情報の型定義
export interface UserStats {
  messageCount: number;
  customerCount: number;
  monthlyCount: number;
}

// メッセージ生成リクエストの型定義
export interface GenerateMessageRequest {
  customerName: string;
  whatHappened: string;
  messageType: string;
  tone: string;
}

// メッセージ生成レスポンスの型定義
export interface GenerateMessageResponse {
  message: string;
  note?: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note_content: string;
  note_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  customerName: string;
  noteContent: string;
  noteType: string;
}

export interface GenerateMessageFromNotesRequest {
  customerName: string;
  messageType: string;
  tone: string;
}

export interface UserTonePreference {
  id: string;
  user_id: string;
  tone_type: string;
  preference_score: number;
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface MessageRating {
  id: string;
  user_id: string;
  message_id: string;
  rating: number;
  tone_type: string;
  feedback?: string;
  created_at: string;
}

export interface ToneAnalysis {
  tone_type: string;
  score: number;
  usage_count: number;
  success_rate: number;
  recommendation: string;
}

// メッセージタイプの定数
export const MESSAGE_TYPES = {
  THANK_YOU: 'thank_you',
  FOLLOW_UP: 'follow_up',
  APPRECIATION: 'appreciation',
  CELEBRATION: 'celebration'
} as const;

// トーンの定数
export const TONES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  FORMAL: 'formal',
  CASUAL: 'casual'
} as const;

// メッセージタイプの日本語マッピング
export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  [MESSAGE_TYPES.THANK_YOU]: 'お礼メッセージ',
  [MESSAGE_TYPES.FOLLOW_UP]: 'フォローアップ',
  [MESSAGE_TYPES.APPRECIATION]: '感謝のメッセージ',
  [MESSAGE_TYPES.CELEBRATION]: 'お祝いメッセージ'
};

// トーンの日本語マッピング
export const TONE_LABELS: Record<string, string> = {
  [TONES.PROFESSIONAL]: 'ビジネスライク',
  [TONES.FRIENDLY]: '親しみやすい',
  [TONES.FORMAL]: 'フォーマル',
  [TONES.CASUAL]: 'カジュアル'
}; 