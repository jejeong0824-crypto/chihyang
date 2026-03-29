import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewDetail } from "@/components/review/review-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: review } = await supabase
    .from("reviews")
    .select("*, users!inner(id, nickname, profile_image)")
    .eq("id", id)
    .single();

  if (!review) notFound();

  const isOwner = authUser?.id === review.user_id;

  if (!review.is_public && !isOwner) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/my">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <ReviewDetail review={review} isOwner={isOwner} />
    </div>
  );
}
