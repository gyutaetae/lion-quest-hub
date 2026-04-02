"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Meeting = Tables<"meetings">;
type Attendance = Tables<"attendance">;
type Profile = Tables<"profiles">;

interface AttendanceWithProfile extends Attendance {
  profile?: Profile;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AttendanceManager() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [attendees, setAttendees] = useState<AttendanceWithProfile[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    setLoadingMeetings(false);

    if (error) {
      toast({ title: "모임 목록 로드 실패", description: error.message });
      return;
    }

    const nextMeetings = (data as Meeting[]) ?? [];
    setMeetings(nextMeetings);
    setSelectedMeetingId((previousMeetingId) => {
      if (!previousMeetingId && nextMeetings[0]) {
        return nextMeetings[0].id;
      }
      if (
        previousMeetingId &&
        !nextMeetings.some((meeting) => meeting.id === previousMeetingId)
      ) {
        return nextMeetings[0]?.id ?? "";
      }
      return previousMeetingId;
    });
  }, [toast]);

  const loadAttendees = useCallback(async (meetingId: string) => {
    if (!meetingId) {
      setAttendees([]);
      return;
    }

    setLoadingAttendees(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("checked_in_at", { ascending: true });
    setLoadingAttendees(false);

    if (error) {
      toast({ title: "출석 목록 로드 실패", description: error.message });
      return;
    }

    const attendanceRows = (data as Attendance[]) ?? [];
    const userIds = [...new Set(attendanceRows.map((row) => row.user_id))];

    if (!userIds.length) {
      setAttendees([]);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const profileMap = new Map(
      ((profileData as Profile[] | null) ?? []).map((profile) => [profile.id, profile]),
    );

    setAttendees(
      attendanceRows.map((row) => ({
        ...row,
        profile: profileMap.get(row.user_id),
      })),
    );
  }, [toast]);

  useEffect(() => {
    void loadMeetings();

    const meetingsChannel = supabase
      .channel("admin-meetings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        () => {
          void loadMeetings();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(meetingsChannel);
    };
  }, [loadMeetings]);

  useEffect(() => {
    if (!selectedMeetingId) {
      setAttendees([]);
      return;
    }

    void loadAttendees(selectedMeetingId);

    const attendanceChannel = supabase
      .channel(`attendance-${selectedMeetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `meeting_id=eq.${selectedMeetingId}`,
        },
        () => {
          void loadAttendees(selectedMeetingId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(attendanceChannel);
    };
  }, [loadAttendees, selectedMeetingId]);

  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null;

  return (
    <Card className="lion-shadow border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          출석 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedMeetingId} onValueChange={setSelectedMeetingId}>
            <SelectTrigger className="sm:flex-1">
              <SelectValue placeholder="출석 확인할 모임을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {meetings.map((meeting) => (
                <SelectItem key={meeting.id} value={meeting.id}>
                  {meeting.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              void loadMeetings();
              if (selectedMeetingId) {
                void loadAttendees(selectedMeetingId);
              }
            }}
            disabled={loadingMeetings || loadingAttendees}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>

        {!selectedMeeting ? (
          <p className="text-sm text-muted-foreground">먼저 QR을 생성해서 모임을 만들어 주세요.</p>
        ) : (
          <>
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="text-sm font-semibold">{selectedMeeting.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                생성: {formatDateTime(selectedMeeting.created_at)} | 출석 인원: {attendees.length}명
              </div>
            </div>

            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {loadingAttendees ? (
                <p className="text-sm text-muted-foreground">출석 정보를 불러오는 중입니다...</p>
              ) : attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">아직 출석한 사람이 없습니다.</p>
              ) : (
                attendees.map((entry, index) => (
                  <div key={entry.id} className="rounded-xl border bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          {index + 1}. {entry.profile?.display_name ?? "이름 없음"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{entry.profile?.username ?? "unknown"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(entry.checked_in_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
