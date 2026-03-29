"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setNickname } from "@/actions/user";

export function NicknameModal({ open }: { open: boolean }) {
  const [nickname, setNicknameValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError("닉네임은 2~20자로 입력해주세요.");
      return;
    }

    setLoading(true);
    const result = await setNickname(trimmed);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>닉네임을 설정해주세요</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => {
              setNicknameValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={20}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "설정 중..." : "시작하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
