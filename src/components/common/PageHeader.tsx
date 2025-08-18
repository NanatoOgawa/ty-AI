"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
  showHomeButton?: boolean;
  rightAction?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showBackButton = false, 
  backUrl = "/dashboard", 
  showHomeButton = false,
  rightAction
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push("/dashboard");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center py-3 min-h-[56px]">
          {/* 左側: 戻るボタンまたはホームボタン */}
          <div className="flex items-center min-w-[44px]">
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="p-3 rounded-full hover:bg-gray-100 touch-manipulation"
                aria-label="戻る"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            )}
            {showHomeButton && !showBackButton && (
              <Button
                onClick={handleHome}
                variant="ghost"
                size="sm"
                className="p-3 rounded-full hover:bg-gray-100 touch-manipulation"
                aria-label="ホーム"
              >
                <span className="text-xl">🏠</span>
              </Button>
            )}
          </div>

          {/* 中央: タイトル */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          </div>

          {/* 右側: アクション */}
          <div className="flex items-center min-w-[44px] justify-end">
            {rightAction}
          </div>
        </div>
      </div>
    </header>
  );
} 