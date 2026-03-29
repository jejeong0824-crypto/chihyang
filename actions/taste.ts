"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { analyzeTasteFromReviews } from "@/lib/claude";
import { revalidatePath } from "next/cache";
import type { TasteComparison } from "@/types";

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function analyzeTaste() {
  const userId = await getAuthUserId();
  if (!userId) return;

  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { contentType: true, contentTitle: true, body: true },
  });

  if (reviews.length < 3) return;

  try {
    const result = await analyzeTasteFromReviews(reviews);

    await prisma.tasteProfile.upsert({
      where: { userId },
      create: {
        userId,
        keywords: result.keywords,
        summary: result.summary,
        type: result.type,
      },
      update: {
        keywords: result.keywords,
        summary: result.summary,
        type: result.type,
      },
    });

    revalidatePath("/my");
  } catch {
    // Claude API 실패 시 무시 — 다음 감상평 작성 시 재시도
  }
}

export async function compareTaste(
  friendId: string,
): Promise<TasteComparison | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const [myProfile, friendProfile] = await Promise.all([
    prisma.tasteProfile.findUnique({ where: { userId } }),
    prisma.tasteProfile.findUnique({ where: { userId: friendId } }),
  ]);

  if (!myProfile || !friendProfile) return null;

  const mySet = new Set(myProfile.keywords);
  const friendSet = new Set(friendProfile.keywords);
  const allKeywords = new Set([...mySet, ...friendSet]);
  const overlapping = [...mySet].filter((k) => friendSet.has(k));

  return {
    myKeywords: myProfile.keywords,
    friendKeywords: friendProfile.keywords,
    overlapping,
    matchRate: Math.round((overlapping.length / allKeywords.size) * 100),
  };
}
