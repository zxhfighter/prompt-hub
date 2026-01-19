import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-8 w-8 text-primary" />
            Prompt Hub
          </Link>
          <p className="mt-4 text-lg text-muted-foreground">
            专业的 AI 提示词版本管理、优化和诊断平台
          </p>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
              <FileText className="h-6 w-6 text-primary" />
              Prompt Hub
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
