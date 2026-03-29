"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import type { SearchResult, ContentType } from "@/types";

interface ContentSearchProps {
  onSelect: (result: SearchResult, type: ContentType) => void;
}

export function ContentSearch({ onSelect }: ContentSearchProps) {
  const [type, setType] = useState<ContentType>("MOVIE");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const res = await fetch(
      `/api/search?type=${type.toLowerCase()}&q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={type}
        onValueChange={(v) => {
          setType(v as ContentType);
          setResults([]);
          setQuery("");
        }}
      >
        <TabsList>
          <TabsTrigger value="MOVIE">영화</TabsTrigger>
          <TabsTrigger value="BOOK">책</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="제목으로 검색"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">검색 중...</p>
      )}

      <div className="flex flex-col gap-1">
        {results.map((item) => (
          <button
            key={item.contentId}
            onClick={() => onSelect(item, type)}
            className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted"
          >
            {item.contentImage ? (
              <img
                src={item.contentImage}
                alt={item.contentTitle}
                className="h-14 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-14 w-10 items-center justify-center rounded bg-muted text-xs">
                ?
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{item.contentTitle}</p>
              <p className="text-xs text-muted-foreground">
                {item.year ?? item.author ?? ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
