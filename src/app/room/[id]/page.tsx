"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import MiniHome from "@/components/social/MiniHome";
import { use } from "react";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <MiniHome profileId={id} />
      </div>
    </div>
  );
}
