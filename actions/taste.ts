"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("content_type, content_title, body")
    .eq("user_id", userId);

  if (!reviews || reviews.length < 3) return;

  try {
    const result = await analyzeTasteFromReviews(
      reviews.map((r) => ({
        contentType: r.content_type,
        contentTitle: r.content_title,
        body: r.body,
      })),
    );

    // Upsert taste profile
    const { data: existing } = await supabase
      .from("taste_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase
        .from("taste_profiles")
        .update({
          keywords: result.keywords,
          summary: result.summary,
          type: result.type,
        })
        .eq("user_id", userId);
    } else {
      await supabase.from("taste_profiles").insert({
        user_id: userId,
        keywords: result.keywords,
        summary: result.summary,
        type: result.type,
      });
    }

    revalidatePath("/my");
  } catch {
    // Claude API 실패 시 무시
  }
}

export async function compareTaste(
  friendId: string,
): Promise<TasteComparison | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const supabase = await createClient();

  const [{ data: myProfile }, { data: friendProfile }] = await Promise.all([
    supabase
      .from("taste_profiles")
      .select("keywords")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("taste_profiles")
      .select("keywords")
      .eq("user_id", friendId)
      .single(),
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
