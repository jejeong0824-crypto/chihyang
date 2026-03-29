import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { FriendCodeInput } from "@/components/friend/friend-code-input";
import { FriendRequestCard } from "@/components/friend/friend-request-card";
import { FriendCard } from "@/components/friend/friend-card";
import { FriendCodeCopy } from "@/components/friend/friend-code-copy";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: dbUser } = await supabase
    .from("users")
    .select("friend_code")
    .eq("id", authUser.id)
    .single();

  // 받은 요청
  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select("id, requester:users!friendships_requester_id_fkey(id, nickname, profile_image)")
    .eq("receiver_id", authUser.id)
    .eq("status", "PENDING");

  // 수락된 친구 관계
  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      "requester_id, receiver_id, requester:users!friendships_requester_id_fkey(id, nickname, profile_image, taste_profiles(type)), receiver:users!friendships_receiver_id_fkey(id, nickname, profile_image, taste_profiles(type))",
    )
    .eq("status", "ACCEPTED")
    .or(`requester_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`);

  const friends = (friendships ?? []).map((f) =>
    f.requester_id === authUser.id ? f.receiver : f.requester,
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-4 text-lg font-semibold">친구 추가</h2>
        <FriendCodeInput />

        <hr className="my-6" />

        {(pendingRequests ?? []).length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-medium">
              받은 요청 ({pendingRequests!.length})
            </h3>
            <div className="mb-6 flex flex-col gap-2">
              {pendingRequests!.map((req: any) => (
                <FriendRequestCard
                  key={req.id}
                  friendshipId={req.id}
                  user={req.requester}
                />
              ))}
            </div>
            <hr className="my-6" />
          </>
        )}

        {friends.length > 0 ? (
          <>
            <h3 className="mb-3 text-sm font-medium">
              내 친구 ({friends.length})
            </h3>
            <div className="flex flex-col gap-2">
              {friends.map((f: any) => (
                <FriendCard
                  key={f.id}
                  id={f.id}
                  nickname={f.nickname}
                  profileImage={f.profile_image}
                  tasteType={f.taste_profiles?.type}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <EmptyState
              icon={Users}
              message="아직 친구가 없어요. 친구 코드를 공유해서 친구를 추가해보세요"
            />
            {dbUser && <FriendCodeCopy code={dbUser.friend_code} />}
          </div>
        )}
      </main>
    </>
  );
}
