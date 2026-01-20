import { Suspense } from "react";
import { getUser } from "@/lib/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCard } from "./components/theme-card";
import { DataExportCard } from "./components/data-export-card";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Get initials for avatar fallback
  const initials = user.email?.split("@")[0].slice(0, 2).toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">设置</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>个人资料</CardTitle>
            <CardDescription>当前登录用户信息 (由认证服务管理)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />{" "}
              {/* Supabase user metadata might contain avatar, keeping empty for now */}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">
                {user.email || "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                User ID: {user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <div className="space-y-6">
          <ThemeCard />
        </div>

        {/* Data Settings */}
        <div className="space-y-6">
          <DataExportCard />
        </div>
      </div>
    </div>
  );
}
