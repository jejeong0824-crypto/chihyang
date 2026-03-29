"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setNickname(nickname: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };
  if (nickname.length < 2 || nickname.length > 20)
    return { error: "닉네임은 2~20자로 입력해주세요." };

  const { error } = await supabase
    .from("users")
    .update({ nickname })
    .eq("id", user.id);

  if (error) return { error: "닉네임 설정에 실패했습니다." };

  revalidatePath("/");
}
