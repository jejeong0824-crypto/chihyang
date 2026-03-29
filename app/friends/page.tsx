import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  // 받은 요청
  const pendingRequests = await prisma.friendship.findMany({
    where: { receiverId: authUser.id, status: "PENDING" },
    include: {
      requester: {
        select: { id: true, nickname: true, profileImage: true },
      },
    },
  });

  // 친구 목록
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: authUser.id }, { receiverId: authUser.id }],
    },
    include: {
      requester: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
          tasteProfile: { select: { type: true } },
        },
      },
      receiver: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
          tasteProfile: { select: { type: true } },
        },
      },
    },
  });

  const friends = friendships.map((f) =>
    f.requesterId === authUser.id ? f.receiver : f.requester,
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-4 text-lg font-semibold">친구 추가</h2>
        <FriendCodeInput />

        <hr className="my-6" />

        {pendingRequests.length > 0 && (
          <>
            <h3 className="mb-3 text-sm font-medium">
              받은 요청 ({pendingRequests.length})
            </h3>
            <div className="mb-6 flex flex-col gap-2">
              {pendingRequests.map((req) => (
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
              {friends.map((f) => (
                <FriendCard
                  key={f.id}
                  id={f.id}
                  nickname={f.nickname}
                  profileImage={f.profileImage}
                  tasteType={f.tasteProfile?.type}
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
            {dbUser && <FriendCodeCopy code={dbUser.friendCode} />}
          </div>
        )}
      </main>
    </>
  );
}
