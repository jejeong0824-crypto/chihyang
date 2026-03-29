import { createClient } from "@/lib/supabase/server";
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

  const { data: dbUser } = await supabase
    .from("users")
    .select("nickname")
    .eq("id", authUser.id)
    .single();

  const needsNickname = !dbUser?.nickname;

  // 친구 목록 조회
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .eq("status", "ACCEPTED")
    .or(`requester_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`);

  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === authUser.id ? f.receiver_id : f.requester_id,
  );

  // 친구 공개 감상평 피드
  let reviews: any[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("*, users!inner(id, nickname, profile_image)")
      .in("user_id", friendIds)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);
    reviews = data ?? [];
  }

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
