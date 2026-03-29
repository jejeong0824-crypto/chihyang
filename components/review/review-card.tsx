import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    content_type: string;
    content_title: string;
    content_image: string | null;
    body: string;
    tags: string[];
    created_at: string;
    users: {
      id: string;
      nickname: string | null;
      profile_image: string | null;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const icon = review.content_type === "MOVIE" ? "🎬" : "📚";
  const date = new Date(review.created_at).toLocaleDateString("ko-KR");

  return (
    <Link href={`/review/${review.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex gap-3 p-4">
          {review.content_image && (
            <img
              src={review.content_image}
              alt={review.content_title}
              className="h-20 w-14 rounded object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-medium">
              {icon} {review.content_title}
            </p>
            <p className="text-xs text-muted-foreground">
              {review.users.nickname ?? "익명"} · {date}
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
