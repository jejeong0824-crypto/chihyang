"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/review/tag-input";
import { createReview } from "@/actions/review";
import { analyzeTaste } from "@/actions/taste";
import { toast } from "sonner";
import type { SearchResult, ContentType } from "@/types";

interface ReviewFormProps {
  content: SearchResult;
  contentType: ContentType;
}

export function ReviewForm({ content, contentType }: ReviewFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) {
      toast.error("감상평을 입력해주세요.");
      return;
    }

    setLoading(true);
    const result = await createReview({
      contentType,
      contentId: content.contentId,
      contentTitle: content.contentTitle,
      contentImage: content.contentImage,
      body: body.trim(),
      tags,
      isPublic,
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (result.shouldAnalyze) {
      analyzeTaste().then(() => {
        toast.success("취향 분석이 업데이트되었어요!");
      });
    }

    router.push(`/review/${result.id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {content.contentImage && (
          <img
            src={content.contentImage}
            alt={content.contentTitle}
            className="h-20 w-14 rounded object-cover"
          />
        )}
        <div>
          <p className="font-medium">{content.contentTitle}</p>
          <p className="text-xs text-muted-foreground">
            {content.year ?? content.author ?? ""}
          </p>
        </div>
      </div>

      <textarea
        placeholder="이 작품에 대한 생각을 자유롭게 적어보세요"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-[200px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        maxLength={5000}
      />

      <div>
        <p className="mb-2 text-sm font-medium">태그</p>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">공개</span>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
