"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  emoji: string;
}

const navItems: NavItem[] = [
  {
    label: "ホーム",
    path: "/dashboard",
    icon: "🏠",
    emoji: "🏠"
  },
  {
    label: "お客様",
    path: "/dashboard/customers",
    icon: "👥",
    emoji: "👥"
  },
  {
    label: "履歴",
    path: "/dashboard/history",
    icon: "📋",
    emoji: "📋"
  },
  {
    label: "分析",
    path: "/dashboard/tone-analysis",
    icon: "📊",
    emoji: "📊"
  }
];

export default function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== "/dashboard" && pathname.startsWith(item.path));
          
          return (
            <Button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center h-16 w-full rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-xl mb-1">{item.emoji}</span>
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </Button>
          );
        })}
      </div>
      {/* セーフエリア対応 */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </div>
  );
}
