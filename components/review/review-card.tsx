import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewWithUser } from "@/types";

export function ReviewCard({ review }: { review: ReviewWithUser }) {
  const icon = review.contentType === "MOVIE" ? "🎬" : "📚";
  const date = new Date(review.createdAt).toLocaleDateString("ko-KR");

  return (
    <Link href={`/review/${review.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex gap-3 p-4">
          {review.contentImage && (
            <img
              src={review.contentImage}
              alt={review.contentTitle}
              className="h-20 w-14 rounded object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-medium">
              {icon} {review.contentTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {review.user.nickname ?? "익명"} · {date}
            </p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {review.body}
            </p>
            {review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {review.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
