/**
 * 日付フォーマット関連のユーティリティ関数
 */
export const dateFormatters = {
  /**
   * 日付を日本語形式でフォーマット
   */
  toJapaneseDate: (dateString: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ja-JP');
  },

  /**
   * 日時を日本語形式でフォーマット（詳細版）
   */
  toJapaneseDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 相対時間を表示（例：2時間前、3日前）
   */
  toRelativeTime: (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "たった今";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}時間前`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}日前`;
    } else {
      return dateFormatters.toJapaneseDate(dateString);
    }
  }
};

/**
 * テキストフォーマット関連のユーティリティ関数
 */
export const textFormatters = {
  /**
   * メッセージの改行を適切に処理
   */
  formatMessage: (message: string): string => {
    if (!message) return '';
    
    // 連続する改行を2つまでに制限
    let formatted = message.replace(/\n{3,}/g, '\n\n');
    
    // 行頭の余分な空白を削除
    formatted = formatted.replace(/^\s+/gm, '');
    
    // 行末の余分な空白を削除
    formatted = formatted.replace(/\s+$/gm, '');
    
    return formatted;
  },

  /**
   * テキストを指定文字数で切り詰め
   */
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  /**
   * 名前からイニシャルを生成
   */
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * 電話番号をフォーマット
   */
  formatPhoneNumber: (phone: string): string => {
    // 数字のみ抽出
    const numbers = phone.replace(/\D/g, '');
    
    // 日本の電話番号形式に変換
    if (numbers.length === 10) {
      return numbers.replace(/(\d{3})(\d{4})(\d{3})/, '$1-$2-$3');
    } else if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    return phone; // 変換できない場合は元の文字列を返す
  }
};

/**
 * バリデーション関連のユーティリティ関数
 */
export const validators = {
  /**
   * メールアドレスの形式チェック
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 電話番号の形式チェック
   */
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^[\d-+().\s]+$/;
    return phoneRegex.test(phone);
  },

  /**
   * 文字列が空でないことをチェック
   */
  isNotEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * 評価値の範囲チェック（1-5）
   */
  isValidRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  }
};

/**
 * URL関連のユーティリティ関数
 */
export const urlUtils = {
  /**
   * URLパラメータを解析
   */
  parseSearchParams: (searchParams: URLSearchParams): Record<string, string> => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  },

  /**
   * オブジェクトをURLパラメータ文字列に変換
   */
  objectToSearchParams: (obj: Record<string, string | null | undefined>): string => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    return params.toString();
  }
};
