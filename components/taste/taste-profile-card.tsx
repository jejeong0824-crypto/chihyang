import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TasteProfileCardProps {
  type: string;
  keywords: string[];
  summary: string;
}

export function TasteProfileCard({
  type,
  keywords,
  summary,
}: TasteProfileCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <p className="text-sm font-medium">✨ 취향 프로필</p>
        <Badge className="w-fit">{type}</Badge>
        <div className="flex flex-wrap gap-1">
          {keywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-xs">
              #{kw}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">&quot;{summary}&quot;</p>
      </CardContent>
    </Card>
  );
}
