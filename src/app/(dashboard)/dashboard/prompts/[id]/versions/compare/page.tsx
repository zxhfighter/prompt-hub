import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VersionDiff } from "@/components/prompts/version-diff";
import { getVersion } from "@/lib/db/queries/prompts";

export default async function CompareVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v1: string; v2: string }>;
}) {
  const { id } = await params;
  const { v1: v1Id, v2: v2Id } = await searchParams;

  if (!v1Id || !v2Id) {
    redirect(`/dashboard/prompts/${id}/versions`);
  }

  // Fetch versions (parallel)
  const [version1, version2] = await Promise.all([
    getVersion(v1Id),
    getVersion(v2Id),
  ]);

  if (!version1 || !version2) {
    redirect(`/dashboard/prompts/${id}/versions`);
  }

  // Determine chronological order
  const [oldVersion, newVersion] =
    version1.versionNumber < version2.versionNumber
      ? [version1, version2]
      : [version2, version1];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-muted-foreground mb-4">
          对比 V{oldVersion.versionNumber} 和 V{newVersion.versionNumber} 的差异
        </h2>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  原始版本 (V{oldVersion.versionNumber})
                </CardTitle>
                <CardDescription>
                  {new Date(
                    oldVersion.publishedAt ??
                      oldVersion.createdAt ??
                      new Date(),
                  ).toLocaleString("zh-CN")}
                </CardDescription>
              </div>
              <Badge variant="secondary">Old</Badge>
            </div>
          </CardHeader>
          <CardContent className="py-2 pb-4 text-sm text-muted-foreground">
            {oldVersion.description || "无版本描述"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  新版本 (V{newVersion.versionNumber})
                </CardTitle>
                <CardDescription>
                  {new Date(
                    newVersion.publishedAt ??
                      newVersion.createdAt ??
                      new Date(),
                  ).toLocaleString("zh-CN")}
                </CardDescription>
              </div>
              <Badge>New</Badge>
            </div>
          </CardHeader>
          <CardContent className="py-2 pb-4 text-sm text-muted-foreground">
            {newVersion.description || "无版本描述"}
          </CardContent>
        </Card>
      </div>

      {/* Diff View */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <VersionDiff
            oldContent={oldVersion.content}
            newContent={newVersion.content}
            oldVersion={oldVersion.versionNumber}
            newVersion={newVersion.versionNumber}
          />
        </CardContent>
      </Card>
    </div>
  );
}
