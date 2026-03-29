import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TasteComparison } from "@/types";

interface TasteCompareProps {
  comparison: TasteComparison;
  myName: string;
  friendName: string;
  mySummary?: string;
  friendSummary?: string;
}

export function TasteCompare({
  comparison,
  myName,
  friendName,
  mySummary,
  friendSummary,
}: TasteCompareProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        <p className="text-sm font-medium">🔀 취향 비교</p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">일치도</span>
            <span className="text-sm font-bold">{comparison.matchRate}%</span>
          </div>
          <Progress value={comparison.matchRate} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs font-medium">{myName}</p>
            <div className="flex flex-wrap gap-1">
              {comparison.myKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant={
                    comparison.overlapping.includes(kw)
                      ? "default"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  #{kw}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium">{friendName}</p>
            <div className="flex flex-wrap gap-1">
              {comparison.friendKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant={
                    comparison.overlapping.includes(kw)
                      ? "default"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  #{kw}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {comparison.overlapping.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium">겹치는 키워드</p>
            <div className="flex flex-wrap gap-1">
              {comparison.overlapping.map((kw) => (
                <Badge key={kw} className="text-[10px]">
                  #{kw}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(mySummary || friendSummary) && (
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            {mySummary && (
              <p>
                {myName}: &quot;{mySummary}&quot;
              </p>
            )}
            {friendSummary && (
              <p>
                {friendName}: &quot;{friendSummary}&quot;
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
