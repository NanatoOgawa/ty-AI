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
  customer_id: string;
  customer_name: string;
  generated_message: string;
  message_type: string;
  tone: string;
  what_happened?: string;
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

// ユーザープロフィールの型定義
export interface UserProfile {
  id: string;
  user_id: string;
  work_name: string;          // 源氏名
  store_type: string;         // 店舗タイプ
  experience_years: number;   // 経験年数
  personality_type: string;   // 性格タイプ
  speaking_style: string;     // 話し方
  age_range: string;          // 年齢層
  specialty_topics: string;   // 得意な話題
  work_schedule: string;      // 勤務時間帯
  created_at: string;
  updated_at: string;
}

// プロフィール選択肢の定義
export const STORE_TYPES = [
  { value: 'cabaret', label: 'キャバクラ' },
  { value: 'snack', label: 'スナック' },
  { value: 'bar', label: 'バー' },
  { value: 'lounge', label: 'ラウンジ' },
  { value: 'club', label: 'クラブ' },
  { value: 'other', label: 'その他' }
] as const;

export const PERSONALITY_TYPES = [
  { value: 'bright', label: '明るい・元気' },
  { value: 'calm', label: '落ち着いた・上品' },
  { value: 'friendly', label: 'フレンドリー・親しみやすい' },
  { value: 'mature', label: '大人っぽい・クール' },
  { value: 'cute', label: '可愛らしい・甘え上手' },
  { value: 'intellectual', label: '知的・話し上手' }
] as const;

export const SPEAKING_STYLES = [
  { value: 'standard', label: '標準語・丁寧語' },
  { value: 'kansai', label: '関西弁' },
  { value: 'casual', label: 'カジュアル・親しみやすい' },
  { value: 'elegant', label: '上品・エレガント' },
  { value: 'natural', label: '自然体・素朴' }
] as const;

export const AGE_RANGES = [
  { value: 'early_20s', label: '20代前半' },
  { value: 'late_20s', label: '20代後半' },
  { value: 'early_30s', label: '30代前半' },
  { value: 'late_30s', label: '30代後半' },
  { value: 'over_40', label: '40代以上' }
] as const;

export const WORK_SCHEDULES = [
  { value: 'evening', label: '夕方〜深夜（18:00-24:00）' },
  { value: 'late_night', label: '深夜〜朝方（22:00-5:00）' },
  { value: 'day_night', label: '昼夜両方（14:00-24:00）' },
  { value: 'weekend', label: '週末中心' },
  { value: 'irregular', label: '不定期' }
] as const; 