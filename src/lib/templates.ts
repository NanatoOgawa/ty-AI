import { MESSAGE_TYPES, TONES, MESSAGE_TYPE_LABELS, TONE_LABELS } from '../types';

// 夜職向けのテンプレートメッセージの定義
export const MESSAGE_TEMPLATES = {
  [MESSAGE_TYPES.THANK_YOU]: {
    [TONES.PROFESSIONAL]: `[お客様名]さん

この度は[出来事]いただき、本当にありがとうございました！

お客様の温かいお気持ちがとても嬉しかったです。
また機会があれば、よろしくお願いします。

お疲れ様でした。お気をつけてお帰りくださいね💕`,
    [TONES.FRIENDLY]: `[お客様名]さん

[出来事]いただき、本当にありがとうございました！

お客様の優しさに心から感謝しています。
また遊びに来てくださいね。いつでもお待ちしています✨

お疲れ様でした！`,
    [TONES.FORMAL]: `[お客様名]さん

この度は[出来事]いただき、心より感謝申し上げます。

お客様のご厚情に深く感謝いたします。
また機会があれば、よろしくお願いいたします。

お疲れ様でした。お気をつけてお帰りくださいね💕`,
    [TONES.CASUAL]: `[お客様名]さん

[出来事]いただき、ありがとうございました！

本当に助かりました。これからもよろしくお願いします。
また近いうちに遊びに来てくださいね✨

お疲れ様でした！`
  },
  [MESSAGE_TYPES.FOLLOW_UP]: {
    [TONES.PROFESSIONAL]: `[お客様名]さん

先日は[出来事]いただき、ありがとうございました！

また機会があれば、よろしくお願いいたします。
いつでもお待ちしています✨

お疲れ様でした！`,
    [TONES.FRIENDLY]: `[お客様名]さん

先日は[出来事]いただき、ありがとうございました！

また遊びに来てくださいね。
いつでもお待ちしています💕

お疲れ様でした！`,
    [TONES.FORMAL]: `[お客様名]さん

先日は[出来事]いただき、心より感謝申し上げます。

また機会があれば、よろしくお願いいたします。
いつでもお待ちしています✨

お疲れ様でした！`,
    [TONES.CASUAL]: `[お客様名]さん

先日は[出来事]いただき、ありがとうございました！

また近いうちに遊びに来てくださいね✨

お疲れ様でした！`
  },
  [MESSAGE_TYPES.APPRECIATION]: {
    [TONES.PROFESSIONAL]: `[お客様名]さん

[出来事]いただき、心より感謝申し上げます。

お客様のご厚情に深く感謝いたします。
これからもよろしくお願いいたします。

またお会いできるのを楽しみにしています💕`,
    [TONES.FRIENDLY]: `[お客様名]さん

[出来事]いただき、本当にありがとうございます！

お客様の温かいお気持ちがとても嬉しいです。
これからもよろしくお願いします。

またお会いできるのを楽しみにしています✨`,
    [TONES.FORMAL]: `[お客様名]さん

[出来事]いただき、深く感謝申し上げます。

お客様のご厚情に深く感謝いたします。
これからもよろしくお願いいたします。

またお会いできるのを楽しみにしています💕`,
    [TONES.CASUAL]: `[お客様名]さん

[出来事]いただき、ありがとうございます！

本当に助かっています。これからもよろしくお願いします。
また近いうちに遊びに来てくださいね✨

ありがとう！`
  },
  [MESSAGE_TYPES.CELEBRATION]: {
    [TONES.PROFESSIONAL]: `[お客様名]さん

[出来事]、心よりお祝い申し上げます。

お客様のご成功を心より祝福いたします。
これからもよろしくお願いいたします。

おめでとうございます！✨`,
    [TONES.FRIENDLY]: `[お客様名]さん

[出来事]、おめでとうございます！

本当に嬉しいです。これからもよろしくお願いします。
また遊びに来てくださいね💕

おめでとうございました！`,
    [TONES.FORMAL]: `[お客様名]さん

[出来事]、心よりお祝い申し上げます。

お客様のご成功を心より祝福いたします。
これからもよろしくお願いいたします。

おめでとうございます！✨`,
    [TONES.CASUAL]: `[お客様名]さん

[出来事]、おめでとうございます！

本当に嬉しいです。これからもよろしくお願いします。
また近いうちに遊びに来てくださいね✨

おめでとう！`
  }
} as const;

// プレビューメッセージを生成する関数
export function generatePreviewMessage(
  messageType: string,
  tone: string,
  customerName: string = "田中太郎",
  whatHappened: string = "商品をご購入いただき"
): string {
  const template = MESSAGE_TEMPLATES[messageType as keyof typeof MESSAGE_TEMPLATES]?.[tone as keyof typeof MESSAGE_TEMPLATES[typeof messageType]];
  
  if (!template) {
    return "テンプレートが見つかりません";
  }

  return template
    .replace(/\[お客様名\]/g, customerName)
    .replace(/\[出来事\]/g, whatHappened);
}

// テンプレート情報を取得する関数
export function getTemplateInfo(messageType: string, tone: string) {
  return {
    type: MESSAGE_TYPE_LABELS[messageType] || messageType,
    tone: TONE_LABELS[tone] || tone,
    preview: generatePreviewMessage(messageType, tone)
  };
} 