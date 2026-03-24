"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useRouter } from "next/navigation";
import MiniHome from "@/features/social/components/MiniHome";

interface RoomViewProps {
  profileId: string;
}

export default function RoomView({ profileId }: RoomViewProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <MiniHome profileId={profileId} />
      </div>
    </div>
  );
}
