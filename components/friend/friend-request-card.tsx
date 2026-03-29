"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptFriendRequest, rejectFriendRequest } from "@/actions/friend";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface FriendRequestCardProps {
  friendshipId: string;
  user: {
    nickname: string | null;
    profileImage: string | null;
  };
}

export function FriendRequestCard({
  friendshipId,
  user,
}: FriendRequestCardProps) {
  const handleAccept = async () => {
    const result = await acceptFriendRequest(friendshipId);
    if (result.error) toast.error(result.error);
  };

  const handleReject = async () => {
    const result = await rejectFriendRequest(friendshipId);
    if (result.error) toast.error(result.error);
  };

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profileImage ?? undefined} />
          <AvatarFallback>{user.nickname?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{user.nickname ?? "익명"}</span>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleAccept} className="h-8 w-8">
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleReject} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
