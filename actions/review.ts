"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      content_type: parsed.data.contentType,
      content_id: parsed.data.contentId,
      content_title: parsed.data.contentTitle,
      content_image: parsed.data.contentImage,
      body: parsed.data.body,
      tags: parsed.data.tags,
      is_public: parsed.data.isPublic,
    })
    .select("id")
    .single();

  if (error) return { error: "저장에 실패했습니다." };

  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  revalidatePath("/");
  revalidatePath("/my");

  return { id: data.id, shouldAnalyze: (count ?? 0) >= 3 };
}

export async function updateReview(input: ReviewUpdateInput) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const parsed = reviewUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", parsed.data.id)
    .single();

  if (!review || review.user_id !== userId) return { error: "권한이 없습니다." };

  const { error } = await supabase
    .from("reviews")
    .update({
      body: parsed.data.body,
      tags: parsed.data.tags,
      is_public: parsed.data.isPublic,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: "수정에 실패했습니다." };

  revalidatePath("/");
  revalidatePath("/my");
  revalidatePath(`/review/${parsed.data.id}`);

  return { shouldAnalyze: true };
}

export async function deleteReview(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "로그인이 필요합니다." };

  const supabase = await createClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!review || review.user_id !== userId) return { error: "권한이 없습니다." };

  await supabase.from("reviews").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/my");

  redirect("/my");
}
