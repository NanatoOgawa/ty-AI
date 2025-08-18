"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { MessageHistory } from "../../types";
import { MESSAGE_TYPE_LABELS, TONE_LABELS } from "../../types";

interface MessageCardProps {
  message: MessageHistory;
  onDelete?: (messageId: string) => void;
  onRate?: (messageId: string, rating: number) => void;
  isDeleting?: boolean;
  showActions?: boolean;
}

export function MessageCard({
  message,
  onDelete,
  onRate,
  isDeleting = false,
  showActions = true
}: MessageCardProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [currentRating, setCurrentRating] = useState<number>(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessage = (messageText: string) => {
    if (!messageText) return '';
    
    // 連続する改行を2つまでに制限
    let formatted = messageText.replace(/\n{3,}/g, '\n\n');
    
    // 行頭の余分な空白を削除
    formatted = formatted.replace(/^\s+/gm, '');
    
    // 行末の余分な空白を削除
    formatted = formatted.replace(/\s+$/gm, '');
    
    return formatted;
  };

  const getMessageTypeLabel = (type: string) => {
    return MESSAGE_TYPE_LABELS[type as keyof typeof MESSAGE_TYPE_LABELS] || type;
  };

  const getToneLabel = (tone: string) => {
    return TONE_LABELS[tone as keyof typeof TONE_LABELS] || tone;
  };

  const handleRating = (rating: number) => {
    setCurrentRating(rating);
    if (onRate) {
      onRate(message.id, rating);
    }
  };

  const truncatedMessage = message.message.length > 100 
    ? message.message.substring(0, 100) + "..."
    : message.message;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">👤</span>
              {message.customer_name}
            </CardTitle>
            <CardDescription className="flex items-center space-x-4 mt-1">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                {getMessageTypeLabel(message.message_type)}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {getToneLabel(message.tone)}
              </span>
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {formatDate(message.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* メッセージ内容 */}
        <div className="mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
              {showFullMessage ? formatMessage(message.message) : truncatedMessage}
            </p>
            {message.message.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullMessage(!showFullMessage)}
                className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
              >
                {showFullMessage ? "折りたたむ" : "全文を表示"}
              </Button>
            )}
          </div>
        </div>

        {/* 元の入力内容（ある場合） */}
        {message.input_content && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">元の入力内容:</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                {message.input_content}
              </p>
            </div>
          </div>
        )}

        {showActions && (
          <div className="space-y-3">
            {/* 評価 */}
            {onRate && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">このメッセージを評価:</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`w-6 h-6 ${
                        star <= currentRating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors touch-manipulation`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 削除ボタン */}
            {onDelete && (
              <div className="flex justify-end">
                <Button
                  onClick={() => onDelete(message.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:border-red-300 touch-manipulation"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600 mr-1"></div>
                      削除中...
                    </div>
                  ) : (
                    "🗑️ 削除"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
