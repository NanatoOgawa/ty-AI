import { MESSAGE_TYPES, TONES, MESSAGE_TYPE_LABELS, TONE_LABELS } from '../types';

// 夜職向けのテンプレートメッセージの定義
export const MESSAGE_TEMPLATES = {
  'thanks': {
    'polite': `[お客様名]さん

この度は[出来事]いただき、本当にありがとうございました！

お客様の温かいお気持ちがとても嬉しかったです。
また機会があれば、よろしくお願いします。

心より感謝申し上げます。`,

    'friendly': `[お客様名]さん

今日は本当にありがとうございました😊

[出来事]とても楽しくて、あっという間でした！
また今度もお会いできるのを楽しみにしています♪

お疲れさまでした！`,

    'formal': `[お客様名]様

この度は[出来事]いただき、誠にありがとうございました。

お客様にお会いできて大変光栄でした。
今後ともどうぞよろしくお願い申し上げます。

敬具`,

    'casual': `[お客様名]さん

今日はありがとう！

[出来事]すごく楽しかったよ〜
また遊びに来てね！

お疲れさま♪`
  },

  'follow_up': {
    'polite': `[お客様名]さん

先日は[出来事]いただき、ありがとうございました。

その後いかがお過ごしでしょうか？
また機会がございましたら、ぜひお声がけください。

お体にお気をつけて。`,

    'friendly': `[お客様名]さん

この前は楽しい時間をありがとうございました😊

[出来事]のこと、まだ覚えてます！
また一緒に楽しい時間を過ごしましょうね♪

元気でいてください！`,

    'formal': `[お客様名]様

先日は貴重なお時間をいただき、ありがとうございました。

[出来事]のお話、大変興味深く拝聴させていただきました。
またお会いできる日を楽しみにしております。

ご自愛ください。`,

    'casual': `[お客様名]さん

この前はありがとう！

[出来事]面白かった〜
また今度話の続きしようね！

元気でね♪`
  },

  'appreciation': {
    'polite': `[お客様名]さん

いつもお世話になっております。

[出来事]本当に感謝しています。
お客様のお気遣いに、心から感動しました。

これからもよろしくお願いします。`,

    'friendly': `[お客様名]さん

いつもありがとうございます😊

[出来事]本当に嬉しかったです！
お客様の優しさに、いつも元気をもらってます♪

また会えるのを楽しみにしてます！`,

    'formal': `[お客様名]様

平素よりお世話になっております。

[出来事]心より感謝申し上げます。
お客様のご厚意に深く感銘を受けました。

今後ともご指導ご鞭撻のほど、よろしくお願いいたします。`,

    'casual': `[お客様名]さん

いつもありがとう！

[出来事]めちゃくちゃ嬉しかった〜
いつも優しくて、本当に感謝してる♪

また会おうね！`
  },

  'celebration': {
    'polite': `[お客様名]さん

[出来事]おめでとうございます！

素晴らしいニュースを聞かせていただき、
私も本当に嬉しい気持ちです。

心からお祝い申し上げます。`,

    'friendly': `[お客様名]さん

[出来事]おめでとうございます🎉

すっごく嬉しいです！
一緒にお祝いできて幸せです♪

本当におめでとう😊`,

    'formal': `[お客様名]様

[出来事]誠におめでとうございます。

この度の慶事を心よりお祝い申し上げます。
今後ますますのご活躍をお祈りしております。

謹んでお祝い申し上げます。`,

    'casual': `[お客様名]さん

[出来事]おめでとう〜🎊

やったね！
一緒にお祝いできて嬉しい♪

本当におめでとう！`
  }
};

// テンプレートを取得する関数
export function getTemplate(messageType: string, tone: string): string {
  const templates = MESSAGE_TEMPLATES as Record<string, Record<string, string>>;
  return templates[messageType]?.[tone] || '';
}

// 利用可能なメッセージタイプを取得
export function getMessageTypes() {
  return MESSAGE_TYPES;
}

// 利用可能なトーンを取得
export function getTones() {
  return TONES;
}

// メッセージタイプのラベルを取得
export function getMessageTypeLabel(messageType: string): string {
  return MESSAGE_TYPE_LABELS[messageType] || messageType;
}

// トーンのラベルを取得
export function getToneLabel(tone: string): string {
  return TONE_LABELS[tone] || tone;
}