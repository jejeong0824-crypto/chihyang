import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { FAB } from "@/components/layout/fab";
import { NicknameModal } from "@/components/auth/nickname-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ReviewCard } from "@/components/review/review-card";
import { Users } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  const needsNickname = !dbUser?.nickname;

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: authUser.id }, { receiverId: authUser.id }],
    },
  });

  const friendIds = friendships.map((f) =>
    f.requesterId === authUser.id ? f.receiverId : f.requesterId,
  );

  const reviews =
    friendIds.length > 0
      ? await prisma.review.findMany({
          where: {
            userId: { in: friendIds },
            isPublic: true,
          },
          include: {
            user: {
              select: { id: true, nickname: true, profileImage: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-4 text-lg font-semibold">친구들의 감상평</h2>
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            message="친구를 추가하고 감상평을 확인해보세요"
            actionLabel="친구 추가하기"
            actionHref="/friends"
          />
        )}
      </main>
      <FAB />
      <NicknameModal open={needsNickname} />
    </>
  );
}
