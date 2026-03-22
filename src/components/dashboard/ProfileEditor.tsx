"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ROOM_THEMES = [
  { value: "sky", label: "하늘빛" },
  { value: "sunset", label: "노을빛" },
  { value: "mint", label: "민트빛" },
  { value: "night", label: "밤하늘" },
];

const ROOM_MOODS = [
  { value: "sleepy", label: "졸린 아기사자" },
  { value: "study", label: "공부하는 사자" },
  { value: "playful", label: "장난꾸러기" },
];

export default function ProfileEditor() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    status_message: "",
    bio: "",
    playlist_url: "",
    favorite_stack: "",
    room_title: "",
    room_theme: "sky",
    room_mood: "sleepy",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      username: profile.username ?? "",
      status_message: profile.status_message ?? "",
      bio: profile.bio ?? "",
      playlist_url: profile.playlist_url ?? "",
      favorite_stack: profile.favorite_stack ?? "",
      room_title: profile.room_title ?? "",
      room_theme: profile.room_theme ?? "sky",
      room_mood: profile.room_mood ?? "sleepy",
    });
  }, [profile]);

  if (!profile) return null;

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        ...form,
        username: form.username.trim().toLowerCase(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      toast({
        title: "프로필 저장 실패",
        description: error.message,
      });
      return;
    }

    await refreshProfile();
    toast({
      title: "프로필 저장 완료",
      description: "닉네임과 미니홈피 설정이 업데이트됐어요.",
    });
  };

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle>내 프로필 설정</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">닉네임</label>
          <Input value={form.display_name} onChange={(e) => updateField("display_name", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">아이디</label>
          <Input value={form.username} onChange={(e) => updateField("username", e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">상태메시지</label>
          <Input value={form.status_message} onChange={(e) => updateField("status_message", e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">소개</label>
          <Textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">자주 쓰는 스택</label>
          <Input value={form.favorite_stack} onChange={(e) => updateField("favorite_stack", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">플레이리스트 URL</label>
          <Input value={form.playlist_url} onChange={(e) => updateField("playlist_url", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">방 제목</label>
          <Input value={form.room_title} onChange={(e) => updateField("room_title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">방 테마</label>
          <Select value={form.room_theme} onValueChange={(value) => updateField("room_theme", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_THEMES.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">아기사자 무드</label>
          <Select value={form.room_mood} onValueChange={(value) => updateField("room_mood", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_MOODS.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  {mood.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            {saving ? "저장 중..." : "프로필 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
