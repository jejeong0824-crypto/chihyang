"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendFriendRequest } from "@/actions/friend";
import { toast } from "sonner";

export function FriendCodeInput() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const result = await sendFriendRequest(code.trim());
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("친구 요청을 보냈어요");
      setCode("");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="친구 코드 입력"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button onClick={handleSubmit} disabled={loading}>
        요청
      </Button>
    </div>
  );
}
