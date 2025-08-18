"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import type { Customer } from "../../types";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onCreateMessage: (customer: Customer) => void;
  onViewNotes: (customer: Customer) => void;
  isDeleting?: boolean;
}

export function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onCreateMessage,
  onViewNotes,
  isDeleting = false
}: CustomerCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* アバター */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getInitials(customer.name)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
              {customer.company && (
                <CardDescription className="text-sm text-gray-600">
                  {customer.company}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showDetails ? "▲" : "▼"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 基本情報（常に表示） */}
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-4 h-4 mr-2">📧</span>
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-4 h-4 mr-2">📞</span>
              {customer.phone}
            </div>
          )}
        </div>

        {/* 詳細情報（展開時のみ表示） */}
        {showDetails && (
          <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
            {customer.birthday && (
              <div className="flex items-center text-sm">
                <span className="w-4 h-4 mr-2">🎂</span>
                <span className="font-medium mr-2">誕生日:</span>
                {formatDate(customer.birthday)}
              </div>
            )}
            {customer.anniversary && (
              <div className="flex items-center text-sm">
                <span className="w-4 h-4 mr-2">💕</span>
                <span className="font-medium mr-2">記念日:</span>
                {formatDate(customer.anniversary)}
              </div>
            )}
            {customer.preferences && (
              <div className="text-sm">
                <span className="font-medium">好み・嗜好:</span>
                <p className="mt-1 text-gray-600">{customer.preferences}</p>
              </div>
            )}
            {customer.important_notes && (
              <div className="text-sm">
                <span className="font-medium text-orange-600">重要なメモ:</span>
                <p className="mt-1 text-gray-600">{customer.important_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onCreateMessage(customer)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm touch-manipulation"
            size="sm"
          >
            💬 メッセージ作成
          </Button>
          <Button
            onClick={() => onViewNotes(customer)}
            variant="outline"
            className="text-sm touch-manipulation"
            size="sm"
          >
            📝 メモ確認
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            onClick={() => onEdit(customer)}
            variant="outline"
            className="text-sm touch-manipulation"
            size="sm"
          >
            ✏️ 編集
          </Button>
          <Button
            onClick={() => onDelete(customer.id)}
            variant="outline"
            className="text-sm text-red-600 hover:text-red-700 hover:border-red-300 touch-manipulation"
            size="sm"
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

        {/* 最終更新日 */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            最終更新: {formatDate(customer.updated_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
