import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LEVEL_NAMES = ["", "응애사자", "아기사자", "코딩사자", "해커사자", "마스터사자"];

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  total_points: number;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, level, total_points")
      .order("total_points", { ascending: false })
      .limit(50);
    if (data) setEntries(data as LeaderboardEntry[]);
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> 실시간 랭킹
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-4">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <span className={`w-7 text-center font-bold text-sm tabular-nums ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}>
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
              </span>
              <Avatar className="w-9 h-9">
                <AvatarImage src={entry.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                  {entry.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{entry.display_name || "이름 없음"}</div>
                <div className="text-xs text-muted-foreground">
                  LV.{entry.level} {LEVEL_NAMES[entry.level]}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm tabular-nums text-primary">{entry.total_points}p</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            아직 등록된 부원이 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
