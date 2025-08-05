import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, showBackButton = false, backUrl = "/dashboard", children }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => router.push(backUrl)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 戻る
              </Button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
} 