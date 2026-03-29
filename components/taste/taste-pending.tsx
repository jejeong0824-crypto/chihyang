import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TastePending({ reviewCount }: { reviewCount: number }) {
  const remaining = Math.max(0, 3 - reviewCount);
  const progress = (reviewCount / 3) * 100;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          감상평을 {remaining}개 더 작성하면
          <br />
          취향을 분석해드려요
        </p>
        <Progress value={progress} className="w-full max-w-[200px]" />
        <p className="text-xs text-muted-foreground">
          {reviewCount}/3
        </p>
      </CardContent>
    </Card>
  );
}
