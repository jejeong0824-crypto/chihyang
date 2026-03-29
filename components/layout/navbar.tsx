"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, PenSquare, Users, User } from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/review/new", label: "작성", icon: PenSquare },
  { href: "/friends", label: "친구", icon: Users },
  { href: "/my", label: "마이", icon: User },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          취향
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
