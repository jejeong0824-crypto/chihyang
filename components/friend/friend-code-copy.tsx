"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function FriendCodeCopy({ code }: { code: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("친구 코드가 복사되었어요");
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>친구 코드: {code}</span>
      <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}
