"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/review/tag-input";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { updateReview, deleteReview } from "@/actions/review";
import { analyzeTaste } from "@/actions/taste";
import { toast } from "sonner";
import Link from "next/link";
import type { ReviewWithUser } from "@/types";

interface ReviewDetailProps {
  review: ReviewWithUser;
  isOwner: boolean;
}

export function ReviewDetail({ review, isOwner }: ReviewDetailProps) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(review.body);
  const [tags, setTags] = useState(review.tags);
  const [isPublic, setIsPublic] = useState(review.isPublic);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const icon = review.contentType === "MOVIE" ? "🎬" : "📚";
  const date = new Date(review.createdAt).toLocaleDateString("ko-KR");

  const handleSave = async () => {
    setLoading(true);
    const result = await updateReview({
      id: review.id,
      body,
      tags,
      isPublic,
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("수정되었습니다.");
      setEditing(false);
      if (result?.shouldAnalyze) {
        analyzeTaste();
      }
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteReview(review.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {review.contentImage && (
          <img
            src={review.contentImage}
            alt={review.contentTitle}
            className="h-20 w-14 rounded object-cover"
          />
        )}
        <div>
          <p className="font-medium">
            {icon} {review.contentTitle}
          </p>
        </div>
      </div>

      <hr />

      {editing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[200px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <TagInput tags={tags} onChange={setTags} />
          <div className="flex items-center justify-between">
            <span className="text-sm">공개</span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm">{review.body}</p>

          <hr />

          {review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            <Link
              href={`/friends/${review.user.id}`}
              className="hover:underline"
            >
              {review.user.nickname ?? "익명"}
            </Link>{" "}
            · {date} · {review.isPublic ? "공개" : "비공개"}
          </p>

          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                수정
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                삭제
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="정말 삭제하시겠어요?"
        description="삭제된 감상평은 복구할 수 없습니다."
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
