"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  const { data: friend } = await supabase
    .from("users")
    .select("id")
    .eq("friend_code", friendCode)
    .single();

  if (!friend) return { error: "존재하지 않는 친구 코드입니다." };
  if (friend.id === userId) return { error: "자기 자신에게 요청할 수 없습니다." };

  // 이미 존재하는 관계 확인
  const { data: existing } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${userId},receiver_id.eq.${friend.id}),and(requester_id.eq.${friend.id},receiver_id.eq.${userId})`,
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "ACCEPTED") return { error: "이미 친구입니다." };
    return { error: "이미 요청이 존재합니다." };
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: userId,
    receiver_id: friend.id,
  });

  if (error) return { error: "요청에 실패했습니다." };

  revalidatePath("/friends");
  return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const { data: friendship } = await supabase
    .from("friendships")
    .select("receiver_id")
    .eq("id", friendshipId)
    .single();

  if (!friendship || friendship.receiver_id !== userId)
    return { error: "권한이 없습니다." };

  await supabase
    .from("friendships")
    .update({ status: "ACCEPTED" })
    .eq("id", friendshipId);

  revalidatePath("/friends");
  revalidatePath("/");
  return { success: true };
}

export async function rejectFriendRequest(friendshipId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const { data: friendship } = await supabase
    .from("friendships")
    .select("receiver_id")
    .eq("id", friendshipId)
    .single();

  if (!friendship || friendship.receiver_id !== userId)
    return { error: "권한이 없습니다." };

  await supabase.from("friendships").delete().eq("id", friendshipId);

  revalidatePath("/friends");
  return { success: true };
}
