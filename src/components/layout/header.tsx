"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, User, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/auth/actions";

interface HeaderProps {
  user?: {
    username: string;
    email: string;
  } | null;
}

const getPageConfig = (pathname: string) => {
  if (pathname === "/dashboard") return { title: "仪表盘", showBack: false };
  if (pathname === "/dashboard/prompts")
    return { title: "提示词列表", showBack: false };
  if (pathname === "/dashboard/tags")
    return { title: "标签管理", showBack: false };
  if (pathname === "/dashboard/settings")
    return { title: "个人设置", showBack: false };
  if (pathname === "/dashboard/prompts/new")
    return { title: "新建提示词", showBack: true };

  if (pathname.match(/^\/dashboard\/prompts\/[^/]+\/edit$/))
    return { title: "编辑提示词", showBack: true };
  if (pathname.match(/^\/dashboard\/prompts\/[^/]+\/versions\/compare$/))
    return { title: "版本对比", showBack: true };
  if (pathname.match(/^\/dashboard\/prompts\/[^/]+\/versions$/))
    return { title: "版本历史", showBack: true };
  if (pathname.match(/^\/dashboard\/prompts\/[^/]+$/))
    return { title: "提示词详情", showBack: true };

  return { title: "提示词管理", showBack: false };
};

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { title, showBack } = getPageConfig(pathname);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {user?.username?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.username?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">
                  {user?.username || "用户"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                个人设置
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
