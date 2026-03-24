"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;
type Friendship = Tables<"friendships">;
type GuestbookEntry = Tables<"guestbook_entries">;

interface MiniHomeProps {
  profileId: string;
}

const themeClassMap: Record<string, string> = {
  sky: "from-sky-100 via-cyan-50 to-white",
  sunset: "from-amber-100 via-rose-50 to-white",
  mint: "from-emerald-100 via-teal-50 to-white",
  night: "from-slate-200 via-blue-100 to-white",
};

const moodCopy: Record<string, string> = {
  sleepy: "아기사자가 포근한 이불 속에서 코딩 꿈을 꾸고 있어요.",
  study: "아기사자가 책상 위에서 과제를 끝내고 있어요.",
  playful: "아기사자가 키보드 위를 뛰어다니며 놀고 있어요.",
};

export default function MiniHome({ profileId }: MiniHomeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Array<Friendship & { requester?: Profile }>>([]);
  const [guestbook, setGuestbook] = useState<Array<GuestbookEntry & { author?: Profile }>>([]);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [guestbookMessage, setGuestbookMessage] = useState("");

  const isMine = user?.id === profileId;

  const themeClass = useMemo(
    () => themeClassMap[profile?.room_theme ?? "sky"] ?? themeClassMap.sky,
    [profile?.room_theme],
  );

  useEffect(() => {
    const load = async () => {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", profileId).single();
      setProfile((profileData as Profile) ?? null);

      const { data: friendData } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`);

      const friendsRaw = (friendData as Friendship[]) ?? [];
      const friendIds = friendsRaw.map((item) => (item.requester_id === profileId ? item.addressee_id : item.requester_id));
      const { data: friendProfiles } = await supabase.from("profiles").select("*").in("id", friendIds);
      setFriends((friendProfiles as Profile[]) ?? []);

      const { data: guestbookData } = await supabase
        .from("guestbook_entries")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(20);

      const guestbookRows = (guestbookData as GuestbookEntry[]) ?? [];
      const authorIds = [...new Set(guestbookRows.map((entry) => entry.author_id))];
      const { data: authorProfiles } = await supabase.from("profiles").select("*").in("id", authorIds);
      const authorMap = new Map((authorProfiles as Profile[] | null)?.map((entry) => [entry.id, entry]) ?? []);
      setGuestbook(guestbookRows.map((entry) => ({ ...entry, author: authorMap.get(entry.author_id) })));

      if (user && !isMine) {
        const { data: friendshipData } = await supabase
          .from("friendships")
          .select("*")
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${user.id})`)
          .maybeSingle();
        setFriendship((friendshipData as Friendship) ?? null);
      }

      if (user && isMine) {
        const { data: pendingData } = await supabase
          .from("friendships")
          .select("*")
          .eq("addressee_id", user.id)
          .eq("status", "pending");

        const pendingRows = (pendingData as Friendship[]) ?? [];
        const requesterIds = pendingRows.map((entry) => entry.requester_id);
        const { data: requesterProfiles } = await supabase.from("profiles").select("*").in("id", requesterIds);
        const requesterMap = new Map((requesterProfiles as Profile[] | null)?.map((entry) => [entry.id, entry]) ?? []);
        setPendingFriends(pendingRows.map((entry) => ({ ...entry, requester: requesterMap.get(entry.requester_id) })));
      }
    };

    void load();
    const guestbookChannel = supabase
      .channel(`guestbook-${profileId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guestbook_entries", filter: `profile_id=eq.${profileId}` }, load)
      .subscribe();

    return () => {
      void supabase.removeChannel(guestbookChannel);
    };
  }, [isMine, profileId, user]);

  const sendFriendRequest = async () => {
    if (!user || isMine) return;
    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: profileId,
    });

    if (error) {
      toast({ title: "친구 요청 실패", description: error.message });
      return;
    }

    toast({ title: "친구 요청 전송", description: "상대가 수락하면 친구가 됩니다." });
    setFriendship({
      id: crypto.randomUUID(),
      requester_id: user.id,
      addressee_id: profileId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const updateFriendRequest = async (id: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "친구 요청 처리 실패", description: error.message });
      return;
    }

    toast({ title: "친구 요청 처리 완료", description: status === "accepted" ? "친구가 되었어요." : "요청을 거절했어요." });
    setPendingFriends((current) => current.filter((entry) => entry.id !== id));
  };

  const submitGuestbook = async () => {
    if (!user || !guestbookMessage.trim()) return;
    const { error } = await supabase.from("guestbook_entries").insert({
      profile_id: profileId,
      author_id: user.id,
      content: guestbookMessage.trim(),
    });
    if (error) {
      toast({ title: "방명록 작성 실패", description: error.message });
      return;
    }
    setGuestbookMessage("");
    toast({ title: "방명록 등록 완료", description: "귀여운 한 줄을 남겼어요." });
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 lion-shadow">
        <div className={`bg-gradient-to-br ${themeClass} p-6`}>
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mini Home</p>
                <h2 className="text-3xl font-bold">{profile.room_title || "아기사자 하우스"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{profile.status_message || "오늘도 한 걸음 성장 중"}</p>
              </div>
              <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-white">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>{profile.display_name?.slice(0, 1) ?? "L"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-bold">{profile.display_name}</div>
                    <div className="text-sm text-muted-foreground">@{profile.username}</div>
                    <div className="mt-2 text-xs text-muted-foreground">LV.{profile.level} · {profile.total_points}P</div>
                  </div>
                </div>
                <div className="mt-5 rounded-3xl bg-white px-5 py-6 shadow-inner">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm font-semibold">오늘의 방 분위기</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {moodCopy[profile.room_mood ?? "sleepy"] ?? moodCopy.sleepy}
                      </div>
                    </div>
                    <div className="text-5xl">🦁</div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 text-sm">
                    <div>좋아하는 스택: {profile.favorite_stack || "아직 비밀"}</div>
                    <div className="mt-1">자기소개: {profile.bio || "아직 소개가 없어요."}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="border-white/60 bg-white/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">친구들</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {friends.slice(0, 5).map((friend) => (
                    <Link key={friend.id} href={`/room/${friend.id}`} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm">
                      <span>{friend.display_name}</span>
                      <span className="text-muted-foreground">@{friend.username}</span>
                    </Link>
                  ))}
                  {friends.length === 0 && <p className="text-sm text-muted-foreground">아직 친구가 없어요.</p>}
                </CardContent>
              </Card>
              {!isMine && user && (
                <Card className="border-white/60 bg-white/70 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base">친구 맺기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!friendship && <Button onClick={sendFriendRequest}>친구 신청</Button>}
                    {friendship?.status === "pending" && <p className="text-sm text-muted-foreground">친구 요청 대기 중</p>}
                    {friendship?.status === "accepted" && <p className="text-sm text-primary">이미 친구입니다.</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Card>

      {isMine && pendingFriends.length > 0 && (
        <Card className="border-0 lion-shadow">
          <CardHeader>
            <CardTitle>받은 친구 요청</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingFriends.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                <div>
                  <div className="font-semibold">{entry.requester?.display_name}</div>
                  <div className="text-xs text-muted-foreground">@{entry.requester?.username}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateFriendRequest(entry.id, "accepted")}>수락</Button>
                  <Button size="sm" variant="outline" onClick={() => updateFriendRequest(entry.id, "declined")}>거절</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-0 lion-shadow">
        <CardHeader>
          <CardTitle>방명록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.guestbook_open && user && (
            <div className="space-y-3">
              <Textarea
                value={guestbookMessage}
                onChange={(e) => setGuestbookMessage(e.target.value)}
                placeholder="싸이월드 감성 한 줄을 남겨 주세요"
              />
              <Button onClick={submitGuestbook}>방명록 남기기</Button>
            </div>
          )}
          <div className="space-y-3">
            {guestbook.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-muted/40 p-4">
                <div className="text-sm font-semibold">{entry.author?.display_name ?? "익명 사자"}</div>
                <div className="mt-1 text-sm text-muted-foreground">{entry.content}</div>
              </div>
            ))}
            {guestbook.length === 0 && <p className="text-sm text-muted-foreground">첫 방명록을 남겨 보세요.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
