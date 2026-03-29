import { NextRequest, NextResponse } from "next/server";
import type { SearchResult } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  if (!type || !q) {
    return NextResponse.json([]);
  }

  if (type === "movie") {
    return NextResponse.json(await searchMovies(q));
  }

  if (type === "book") {
    return NextResponse.json(await searchBooks(q));
  }

  return NextResponse.json([]);
}

async function searchMovies(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=ko-KR`,
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? []).slice(0, 10).map(
    (m: {
      id: number;
      title: string;
      poster_path: string | null;
      release_date?: string;
    }): SearchResult => ({
      contentId: String(m.id),
      contentTitle: m.title,
      contentImage: m.poster_path
        ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
        : null,
      year: m.release_date?.slice(0, 4),
    }),
  );
}

async function searchBooks(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ko&maxResults=10&key=${apiKey}`,
  );

  if (!res.ok) return [];

  const data = await res.json();
  return (data.items ?? []).map(
    (b: {
      id: string;
      volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: { thumbnail?: string };
      };
    }): SearchResult => ({
      contentId: b.id,
      contentTitle: b.volumeInfo.title,
      contentImage: b.volumeInfo.imageLinks?.thumbnail ?? null,
      author: b.volumeInfo.authors?.join(", "),
    }),
  );
}
