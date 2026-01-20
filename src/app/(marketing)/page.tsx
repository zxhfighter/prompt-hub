import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, GitBranch, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6 text-primary" />
            灵思妙语
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/register">免费注册</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          专业的 AI 提示词
          <span className="text-primary">管理平台</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          创建、管理、优化和版本控制你的 AI 提示词。 支持 Markdown 编辑、AI
          诊断和团队协作。
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">开始使用</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">查看演示</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">核心功能</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={GitBranch}
              title="版本控制"
              description="像管理代码一样管理提示词，支持版本对比和回滚"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI 诊断优化"
              description="智能分析提示词质量，提供具体改进建议"
            />
            <FeatureCard
              icon={Zap}
              title="Markdown 支持"
              description="使用 Markdown 编写提示词，实时预览渲染效果"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © 2026 灵思妙语. All rights reserved.
        </div>
      </footer>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
