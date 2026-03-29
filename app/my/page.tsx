import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasteProfileCard } from "@/components/taste/taste-profile-card";
import { TastePending } from "@/components/taste/taste-pending";
import { ReviewCard } from "@/components/review/review-card";
import { FriendCodeCopy } from "@/components/friend/friend-code-copy";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { tasteProfile: true },
  });

  if (!dbUser) return null;

  const reviews = await prisma.review.findMany({
    where: { userId: authUser.id },
    include: {
      user: {
        select: { id: true, nickname: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const movieReviews = reviews.filter((r) => r.contentType === "MOVIE");
  const bookReviews = reviews.filter((r) => r.contentType === "BOOK");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={dbUser.profileImage ?? undefined} />
            <AvatarFallback>
              {dbUser.nickname?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{dbUser.nickname ?? "닉네임 없음"}</p>
            <FriendCodeCopy code={dbUser.friendCode} />
          </div>
        </div>

        <div className="mb-6">
          {dbUser.tasteProfile ? (
            <TasteProfileCard
              type={dbUser.tasteProfile.type}
              keywords={dbUser.tasteProfile.keywords}
              summary={dbUser.tasteProfile.summary}
            />
          ) : (
            <TastePending reviewCount={reviews.length} />
          )}
        </div>

        <h2 className="mb-3 text-lg font-semibold">내 감상평</h2>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="movie">영화</TabsTrigger>
            <TabsTrigger value="book">책</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 flex flex-col gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </TabsContent>
          <TabsContent value="movie" className="mt-4 flex flex-col gap-4">
            {movieReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </TabsContent>
          <TabsContent value="book" className="mt-4 flex flex-col gap-4">
            {bookReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
