'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>外观设置</CardTitle>
          <CardDescription>自定义界面主题颜色</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>外观设置</CardTitle>
        <CardDescription>自定义界面主题颜色</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            className="flex-1 min-w-[100px]"
          >
            <Sun className="mr-2 h-4 w-4" />
            浅色
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            className="flex-1 min-w-[100px]"
          >
            <Moon className="mr-2 h-4 w-4" />
            深色
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            onClick={() => setTheme('system')}
            className="flex-1 min-w-[100px]"
          >
            <Laptop className="mr-2 h-4 w-4" />
            跟随系统
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
