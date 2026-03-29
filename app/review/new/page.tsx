"use client";

import { useState } from "react";
import { ContentSearch } from "@/components/review/content-search";
import { ReviewForm } from "@/components/review/review-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { SearchResult, ContentType } from "@/types";

export default function ReviewNewPage() {
  const [selected, setSelected] = useState<{
    result: SearchResult;
    type: ContentType;
  } | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        {selected && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelected(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">감상평 작성</h1>
      </div>

      {!selected ? (
        <ContentSearch
          onSelect={(result, type) => setSelected({ result, type })}
        />
      ) : (
        <ReviewForm content={selected.result} contentType={selected.type} />
      )}
    </div>
  );
}
