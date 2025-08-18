"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import type { Customer } from "../../types";

export interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  preferences: string;
  important_notes: string;
  birthday: string;
  anniversary: string;
}

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CustomerForm({ 
  customer, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitLabel = "保存"
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || "",
    company: customer?.company || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    preferences: customer?.preferences || "",
    important_notes: customer?.important_notes || "",
    birthday: customer?.birthday || "",
    anniversary: customer?.anniversary || ""
  });

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "お客様名は必須です";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (formData.phone && !/^[\d-+().\s]+$/.test(formData.phone)) {
      newErrors.phone = "有効な電話番号を入力してください";
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
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* お客様名 */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            お客様名 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`mt-1 ${errors.name ? 'border-red-300' : ''}`}
            placeholder="山田太郎"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 会社名 */}
        <div>
          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
            会社名
          </Label>
          <Input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="mt-1"
            placeholder="株式会社サンプル"
            disabled={isLoading}
          />
        </div>

        {/* メールアドレス */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            メールアドレス
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`mt-1 ${errors.email ? 'border-red-300' : ''}`}
            placeholder="example@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            電話番号
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`mt-1 ${errors.phone ? 'border-red-300' : ''}`}
            placeholder="03-1234-5678"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* 誕生日 */}
        <div>
          <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">
            誕生日
          </Label>
          <Input
            id="birthday"
            type="date"
            value={formData.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        {/* 記念日 */}
        <div>
          <Label htmlFor="anniversary" className="text-sm font-medium text-gray-700">
            記念日
          </Label>
          <Input
            id="anniversary"
            type="date"
            value={formData.anniversary}
            onChange={(e) => handleInputChange('anniversary', e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        {/* 好み・嗜好 */}
        <div>
          <Label htmlFor="preferences" className="text-sm font-medium text-gray-700">
            好み・嗜好
          </Label>
          <Textarea
            id="preferences"
            value={formData.preferences}
            onChange={(e) => handleInputChange('preferences', e.target.value)}
            className="mt-1"
            placeholder="コーヒー好き、甘いものが苦手など"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* 重要なメモ */}
        <div>
          <Label htmlFor="important_notes" className="text-sm font-medium text-gray-700">
            重要なメモ
          </Label>
          <Textarea
            id="important_notes"
            value={formData.important_notes}
            onChange={(e) => handleInputChange('important_notes', e.target.value)}
            className="mt-1"
            placeholder="アレルギー情報、注意事項など"
            rows={3}
            disabled={isLoading}
          />
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
              保存中...
            </div>
          ) : (
            submitLabel
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 touch-manipulation"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
