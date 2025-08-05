// アプリケーション固有のエラークラス
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// データベースエラー
export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 500, code);
    this.name = 'DatabaseError';
  }
}

// 認証エラー
export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthError';
  }
}

// バリデーションエラー
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

// エラーメッセージの定数
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'ユーザーが認証されていません',
  INVALID_REQUEST: '無効なリクエストです',
  DATABASE_ERROR: 'データベースエラーが発生しました',
  MESSAGE_GENERATION_FAILED: 'メッセージの生成に失敗しました',
  CUSTOMER_NOT_FOUND: 'お客様が見つかりません',
  MESSAGE_NOT_FOUND: 'メッセージが見つかりません'
} as const; 