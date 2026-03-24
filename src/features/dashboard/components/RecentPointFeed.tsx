"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PointLog = Tables<"points_log">;
type Profile = Tables<"profiles">;

interface FeedItem extends PointLog {
  profile?: Profile;
}

export default function RecentPointFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("points_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      const logs = (data as PointLog[]) ?? [];
      const userIds = [...new Set(logs.map((item) => item.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const profileMap = new Map((profiles as Profile[] | null)?.map((profile) => [profile.id, profile]) ?? []);
      setItems(logs.map((log) => ({ ...log, profile: profileMap.get(log.user_id) })));
    };

    void load();
    const channel = supabase
      .channel("points-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "points_log" }, load)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle>실시간 포인트 피드</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{item.profile?.display_name ?? "알 수 없음"}</div>
                <div className="text-xs text-muted-foreground">{item.reason}</div>
              </div>
              <div className="text-sm font-bold text-primary">+{item.points}P</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
