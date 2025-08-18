/**
 * アプリケーション全体で使用される定数
 */

// ページサイズ・制限値
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_NOTE_LENGTH: 1000,
  MAX_CUSTOMER_NAME_LENGTH: 100,
  MAX_COMPANY_NAME_LENGTH: 200,
  MESSAGES_PER_PAGE: 20,
  CUSTOMERS_PER_PAGE: 50
} as const;

// デフォルト値
export const DEFAULTS = {
  MESSAGE_TYPE: 'thanks',
  TONE: 'polite',
  CONTAINER_MAX_WIDTH: 'max-w-md',
  LOADING_DELAY: 300 // ms
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました。しばらくしてからもう一度お試しください。',
  AUTH_ERROR: '認証エラーが発生しました。ログインし直してください。',
  VALIDATION_ERROR: '入力内容に不備があります。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
  
  // フィールド別エラー
  REQUIRED_FIELD: 'この項目は必須です',
  INVALID_EMAIL: '有効なメールアドレスを入力してください',
  INVALID_PHONE: '有効な電話番号を入力してください',
  INVALID_DATE: '有効な日付を入力してください',
  TEXT_TOO_LONG: '文字数が上限を超えています',
  
  // 操作別エラー
  SAVE_FAILED: '保存に失敗しました',
  DELETE_FAILED: '削除に失敗しました',
  LOAD_FAILED: 'データの読み込みに失敗しました',
  GENERATE_FAILED: 'メッセージの生成に失敗しました'
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存しました',
  DELETE_SUCCESS: '削除しました',
  UPDATE_SUCCESS: '更新しました',
  CREATE_SUCCESS: '作成しました',
  GENERATE_SUCCESS: 'メッセージを生成しました'
} as const;

// API関連
export const API = {
  ENDPOINTS: {
    GENERATE_MESSAGE: '/api/generate-message',
    GENERATE_MESSAGE_FROM_NOTES: '/api/generate-message-from-notes'
  },
  TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3
} as const;

// UI関連
export const UI = {
  MOBILE_BREAKPOINT: 768,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOUCH_TARGET_SIZE: 44, // px
  
  COLORS: {
    PRIMARY: 'blue',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'gray'
  },
  
  Z_INDEX: {
    MODAL: 50,
    DROPDOWN: 40,
    HEADER: 40,
    NAVIGATION: 50,
    OVERLAY: 30
  }
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'ty-ai-user-preferences',
  DRAFT_MESSAGE: 'ty-ai-draft-message',
  LAST_CUSTOMER: 'ty-ai-last-customer',
  THEME: 'ty-ai-theme'
} as const;

// 日付フォーマット
export const DATE_FORMATS = {
  JAPANESE_DATE: 'ja-JP',
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'YYYY年MM月DD日',
  DISPLAY_DATETIME: 'YYYY年MM月DD日 HH:mm'
} as const;

// 正規表現パターン
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d-+().\s]+$/,
  JAPANESE_PHONE: /^(\d{2,4}-\d{2,4}-\d{4}|\d{3}-\d{4}-\d{4})$/,
  POSTAL_CODE: /^\d{3}-\d{4}$/
} as const;
