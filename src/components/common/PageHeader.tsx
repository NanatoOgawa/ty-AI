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
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => router.push(backUrl)}
                className="text-gray-600 hover:text-gray-900 p-2 h-8"
              >
                ←
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
} 