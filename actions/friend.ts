"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function sendFriendRequest(friendCode: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const friend = await prisma.user.findUnique({
    where: { friendCode },
  });

  if (!friend) return { error: "존재하지 않는 친구 코드입니다." };
  if (friend.id === userId) return { error: "자기 자신에게 요청할 수 없습니다." };

  // 이미 요청이 있는지 확인
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, receiverId: friend.id },
        { requesterId: friend.id, receiverId: userId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") return { error: "이미 친구입니다." };
    return { error: "이미 요청이 존재합니다." };
  }

  await prisma.friendship.create({
    data: {
      requesterId: userId,
      receiverId: friend.id,
    },
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.receiverId !== userId) {
    return { error: "권한이 없습니다." };
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/friends");
  revalidatePath("/");
  return { success: true };
}

export async function rejectFriendRequest(friendshipId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship || friendship.receiverId !== userId) {
    return { error: "권한이 없습니다." };
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/friends");
  return { success: true };
}
