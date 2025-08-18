// お客様情報の型定義
export interface Customer {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  preferences?: string;
  important_notes?: string;
  birthday?: string;
  anniversary?: string;
  created_at: string;
  updated_at: string;
}

// メッセージ履歴の型定義
export interface MessageHistory {
  id: string;
  user_id: string;
  customer_name: string;
  message: string;
  message_type: string;
  tone: string;
  input_content?: string;
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
  user_id: string;
  customer_name: string;
  note: string;
  created_at: string;
  updated_at?: string;
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
export const MESSAGE_TYPES = [
  { value: 'thanks', label: 'お礼メッセージ' },
  { value: 'follow_up', label: 'フォローアップ' },
  { value: 'appreciation', label: '感謝のメッセージ' },
  { value: 'celebration', label: 'お祝いメッセージ' }
] as const;

// トーンの定数
export const TONES = [
  { value: 'polite', label: '丁寧' },
  { value: 'friendly', label: 'フレンドリー' },
  { value: 'formal', label: 'フォーマル' },
  { value: 'casual', label: 'カジュアル' }
] as const;

// 型定義
export type MessageType = typeof MESSAGE_TYPES[number]['value'];
export type Tone = typeof TONES[number]['value'];

// メッセージタイプの日本語マッピング
export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  'thanks': 'お礼メッセージ',
  'follow_up': 'フォローアップ',
  'appreciation': '感謝のメッセージ',
  'celebration': 'お祝いメッセージ'
};

// トーンの日本語マッピング
export const TONE_LABELS: Record<string, string> = {
  'polite': '丁寧',
  'friendly': 'フレンドリー',
  'formal': 'フォーマル',
  'casual': 'カジュアル'
}; 