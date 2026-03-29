import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
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

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, nickname: true, profileImage: true },
      },
    },
  });

  if (!review) notFound();

  const isOwner = authUser?.id === review.userId;

  // 비공개 감상평은 본인만 볼 수 있음
  if (!review.isPublic && !isOwner) notFound();

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
