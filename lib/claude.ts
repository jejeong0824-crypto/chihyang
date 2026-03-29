import Anthropic from "@anthropic-ai/sdk";
import type { TasteProfileData } from "@/types";

const anthropic = new Anthropic();

export async function analyzeTasteFromReviews(
  reviews: { contentType: string; contentTitle: string; body: string }[],
): Promise<TasteProfileData> {
  const reviewTexts = reviews
    .map((r) => `[${r.contentType === "MOVIE" ? "영화" : "책"}] ${r.contentTitle}: "${r.body}"`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 1024,
    system: `당신은 영화/책 취향 분석 전문가입니다.
사용자의 감상평들을 읽고 취향을 분석해주세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "keywords": ["키워드1", "키워드2", ...],
  "summary": "취향 요약 1~2문장",
  "type": "취향 유형명"
}

- keywords: 감상평에서 반복적으로 드러나는 선호 요소 5~8개 (예: "복선 회수", "잔잔한 전개")
- summary: 이 사용자의 취향을 1~2문장으로 요약
- type: 한 단어로 된 취향 유형 (예: "서사 몰입형", "감성 여운형", "지적 자극형")`,
    messages: [
      {
        role: "user",
        content: `다음은 사용자의 감상평들입니다:\n\n${reviewTexts}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const json = JSON.parse(text);

  return {
    keywords: json.keywords,
    summary: json.summary,
    type: json.type,
  };
}
