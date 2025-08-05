import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { generatePreviewMessage } from "../../lib/templates";
import { MESSAGE_TYPES, TONES } from "../../types";

interface MessagePreviewProps {
  messageType: string;
  tone: string;
  customerName: string;
  whatHappened: string;
  onSelect?: () => void;
}

export function MessagePreview({ 
  messageType, 
  tone, 
  customerName, 
  whatHappened, 
  onSelect 
}: MessagePreviewProps) {
  const previewMessage = generatePreviewMessage(messageType, tone, customerName, whatHappened);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      alert('コピーしました！');
    } catch (error) {
      console.error('コピーに失敗しました:', error);
    }
  };

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>📝 プレビュー</span>
          {onSelect && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSelect}
              className="text-xs h-8"
            >
              使用
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          メッセージの雰囲気を確認
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="text-xs text-gray-600 mb-2">プレビュー:</div>
            <div className="whitespace-pre-wrap text-gray-900 text-sm">
              {previewMessage}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600">
              <span className="font-medium">設定:</span> {messageType} / {tone}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopy}
              className="text-xs h-8"
            >
              📋 コピー
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 