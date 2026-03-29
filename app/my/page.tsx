import { createClient } from "@/lib/supabase/server";
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

  const { data: dbUser } = await supabase
    .from("users")
    .select("*, taste_profiles(*)")
    .eq("id", authUser.id)
    .single();

  if (!dbUser) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, users!inner(id, nickname, profile_image)")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false });

  const allReviews = reviews ?? [];
  const movieReviews = allReviews.filter((r) => r.content_type === "MOVIE");
  const bookReviews = allReviews.filter((r) => r.content_type === "BOOK");
  const tasteProfile = dbUser.taste_profiles;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={dbUser.profile_image ?? undefined} />
            <AvatarFallback>
              {dbUser.nickname?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{dbUser.nickname ?? "닉네임 없음"}</p>
            <FriendCodeCopy code={dbUser.friend_code} />
          </div>
        </div>

        <div className="mb-6">
          {tasteProfile ? (
            <TasteProfileCard
              type={tasteProfile.type}
              keywords={tasteProfile.keywords}
              summary={tasteProfile.summary}
            />
          ) : (
            <TastePending reviewCount={allReviews.length} />
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
            {allReviews.map((r) => (
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
