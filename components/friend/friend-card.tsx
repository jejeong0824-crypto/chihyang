import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FriendCardProps {
  id: string;
  nickname: string | null;
  profileImage: string | null;
  tasteType?: string | null;
}

export function FriendCard({
  id,
  nickname,
  profileImage,
  tasteType,
}: FriendCardProps) {
  return (
    <Link
      href={`/friends/${id}`}
      className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profileImage ?? undefined} />
          <AvatarFallback>{nickname?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{nickname ?? "익명"}</span>
      </div>
      {tasteType && (
        <Badge variant="secondary" className="text-xs">
          {tasteType}
        </Badge>
      )}
    </Link>
  );
}
