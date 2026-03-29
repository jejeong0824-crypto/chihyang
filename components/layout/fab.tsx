"use client";

import Link from "next/link";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FAB() {
  return (
    <Button
      asChild
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
    >
      <Link href="/review/new">
        <PenSquare className="h-5 w-5" />
        <span className="sr-only">감상평 쓰기</span>
      </Link>
    </Button>
  );
}
