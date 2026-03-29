"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reviewSchema, reviewUpdateSchema } from "@/lib/validations";
import type { ReviewInput, ReviewUpdateInput } from "@/lib/validations";

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function createReview(input: ReviewInput) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const review = await prisma.review.create({
    data: {
      userId,
      ...parsed.data,
    },
  });

  // 취향 분석 트리거
  const count = await prisma.review.count({ where: { userId } });
  const shouldAnalyze = count >= 3;

  revalidatePath("/");
  revalidatePath("/my");

  return { id: review.id, shouldAnalyze };
}

export async function updateReview(input: ReviewUpdateInput) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const parsed = reviewUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const review = await prisma.review.findUnique({
    where: { id: parsed.data.id },
  });

  if (!review || review.userId !== userId) {
    return { error: "권한이 없습니다." };
  }

  await prisma.review.update({
    where: { id: parsed.data.id },
    data: {
      body: parsed.data.body,
      tags: parsed.data.tags,
      isPublic: parsed.data.isPublic,
    },
  });

  revalidatePath("/");
  revalidatePath("/my");
  revalidatePath(`/review/${parsed.data.id}`);

  return { shouldAnalyze: true };
}

export async function deleteReview(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.userId !== userId) {
    return { error: "권한이 없습니다." };
  }

  await prisma.review.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/my");

  redirect("/my");
}

export async function getMyReviews(contentType?: "MOVIE" | "BOOK") {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.review.findMany({
    where: {
      userId,
      ...(contentType ? { contentType } : {}),
    },
    include: {
      user: {
        select: { id: true, nickname: true, profileImage: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFriendFeed() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
  });

  const friendIds = friendships.map((f) =>
    f.requesterId === userId ? f.receiverId : f.requesterId,
  );

  if (friendIds.length === 0) return [];

  return prisma.review.findMany({
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
  });
}
