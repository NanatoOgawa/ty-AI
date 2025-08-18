"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import type { MessageType, Tone } from "../../types";
import { MESSAGE_TYPES, TONES } from "../../types";

export interface MessageFormData {
  customerName: string;
  inputContent: string;
  messageType: MessageType;
  tone: Tone;
}

interface MessageFormProps {
  initialData?: Partial<MessageFormData>;
  onSubmit: (data: MessageFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
}

export function MessageForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "AIメッセージ生成",
  showCancel = false
}: MessageFormProps) {
  const [formData, setFormData] = useState<MessageFormData>({
    customerName: initialData.customerName || "",
    inputContent: initialData.inputContent || "",
    messageType: initialData.messageType || "thanks",
    tone: initialData.tone || "polite"
  });

  const [errors, setErrors] = useState<Partial<MessageFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<MessageFormData> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "お客様名は必須です";
    }

    if (!formData.inputContent.trim()) {
      newErrors.inputContent = "内容は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Message form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof MessageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* お客様名 */}
      <div>
        <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
          お客様名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="customerName"
          type="text"
          value={formData.customerName}
          onChange={(e) => handleInputChange('customerName', e.target.value)}
          className={`mt-1 ${errors.customerName ? 'border-red-300' : ''}`}
          placeholder="山田太郎"
          disabled={isLoading}
        />
        {errors.customerName && (
          <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
        )}
      </div>

      {/* メッセージ内容 */}
      <div>
        <Label htmlFor="inputContent" className="text-sm font-medium text-gray-700">
          メッセージ内容 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="inputContent"
          value={formData.inputContent}
          onChange={(e) => handleInputChange('inputContent', e.target.value)}
          className={`mt-1 ${errors.inputContent ? 'border-red-300' : ''}`}
          placeholder="今日はありがとうございました。美味しいコーヒーをいただき、とても満足しています。"
          rows={4}
          disabled={isLoading}
        />
        {errors.inputContent && (
          <p className="mt-1 text-sm text-red-600">{errors.inputContent}</p>
        )}
      </div>

      {/* メッセージタイプ */}
      <div>
        <Label className="text-sm font-medium text-gray-700">
          メッセージタイプ
        </Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MESSAGE_TYPES.map((type) => (
            <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="messageType"
                value={type.value}
                checked={formData.messageType === type.value}
                onChange={(e) => handleInputChange('messageType', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* トーン */}
      <div>
        <Label className="text-sm font-medium text-gray-700">
          トーン
        </Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TONES.map((tone) => (
            <label key={tone.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tone"
                value={tone.value}
                checked={formData.tone === tone.value}
                onChange={(e) => handleInputChange('tone', e.target.value as Tone)}
                className="text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">{tone.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white touch-manipulation"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成中...
            </div>
          ) : (
            submitLabel
          )}
        </Button>
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 touch-manipulation"
          >
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
