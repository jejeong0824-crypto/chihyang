import { z } from "zod/v4";

export const nicknameSchema = z
  .string()
  .min(2, "닉네임은 2자 이상이어야 합니다.")
  .max(20, "닉네임은 20자 이하여야 합니다.");

export const reviewSchema = z.object({
  contentType: z.enum(["MOVIE", "BOOK"]),
  contentId: z.string().min(1),
  contentTitle: z.string().min(1),
  contentImage: z.string().nullable(),
  body: z.string().min(1, "감상평을 입력해주세요.").max(5000),
  tags: z.array(z.string()).max(10, "태그는 최대 10개까지 가능합니다."),
  isPublic: z.boolean(),
});

export const reviewUpdateSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1, "감상평을 입력해주세요.").max(5000),
  tags: z.array(z.string()).max(10),
  isPublic: z.boolean(),
});

export const friendCodeSchema = z
  .string()
  .min(1, "친구 코드를 입력해주세요.");

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
