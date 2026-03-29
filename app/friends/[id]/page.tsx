import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { compareTaste } from "@/actions/taste";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TasteCompare } from "@/components/taste/taste-compare";
import { EmptyState } from "@/components/shared/empty-state";
import { ReviewCard } from "@/components/review/review-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function FriendProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const friend = await prisma.user.findUnique({
    where: { id },
    include: { tasteProfile: true },
  });

  if (!friend) notFound();

  const myUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { tasteProfile: true },
  });

  const comparison = await compareTaste(id);

  const reviews = await prisma.review.findMany({
    where: { userId: id, isPublic: true },
    include: {
      user: {
        select: { id: true, nickname: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/friends">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={friend.profileImage ?? undefined} />
          <AvatarFallback>
            {friend.nickname?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{friend.nickname ?? "익명"}</p>
          {friend.tasteProfile && (
            <Badge variant="secondary">{friend.tasteProfile.type}</Badge>
          )}
        </div>
      </div>

      <div className="mb-6">
        {comparison ? (
          <TasteCompare
            comparison={comparison}
            myName={myUser?.nickname ?? "나"}
            friendName={friend.nickname ?? "친구"}
            mySummary={myUser?.tasteProfile?.summary}
            friendSummary={friend.tasteProfile?.summary}
          />
        ) : (
          <EmptyState message="아직 취향 분석이 완료되지 않았어요" />
        )}
      </div>

      <h3 className="mb-3 text-sm font-medium">
        {friend.nickname ?? "친구"}의 감상평
      </h3>
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </div>
  );
}
