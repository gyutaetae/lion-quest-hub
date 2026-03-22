"use client";

import { useEffect, useState } from "react";
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
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type ActivityType = Tables<"activity_types">;

export default function PointManager() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [userId, setUserId] = useState("");
  const [activityCode, setActivityCode] = useState("");
  const [referenceKey, setReferenceKey] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: profileData }, { data: activityData }] = await Promise.all([
        supabase.from("profiles").select("*").order("display_name"),
        supabase.from("activity_types").select("*").order("points"),
      ]);
      setProfiles((profileData as Profile[]) ?? []);
      setActivities((activityData as ActivityType[]) ?? []);
      if (!activityCode && activityData?.[0]) setActivityCode(activityData[0].code);
    };
    void load();
  }, [activityCode]);

  const submit = async () => {
    if (!userId || !activityCode) return;
    setSubmitting(true);

    const { data, error } = await supabase.rpc("award_activity_points", {
      _user_id: userId,
      _activity_code: activityCode,
      _reference_key: referenceKey || undefined,
      _description: description || undefined,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "포인트 지급 실패", description: error.message });
      return;
    }

    const result = data as { success?: boolean; message?: string } | null;
    toast({
      title: result?.success ? "포인트 지급 완료" : "중복 지급 차단",
      description: result?.message ?? "결과를 확인해 주세요.",
    });

    if (result?.success) {
      setReferenceKey("");
      setDescription("");
    }
  };

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle>운영진 포인트 관리</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">부원 선택</label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="부원을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.display_name} · {profile.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">활동 타입</label>
          <Select value={activityCode} onValueChange={setActivityCode}>
            <SelectTrigger>
              <SelectValue placeholder="활동을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.code}>
                  {activity.name} (+{activity.points}P)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">중복 방지 키</label>
          <Input
            value={referenceKey}
            onChange={(e) => setReferenceKey(e.target.value)}
            placeholder="예: assignment-week-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">메모</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 3주차 과제 제출 확인"
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={submit} disabled={submitting || !userId || !activityCode}>
            {submitting ? "지급 중..." : "포인트 지급"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
