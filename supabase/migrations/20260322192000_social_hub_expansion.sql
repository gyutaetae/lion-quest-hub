ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS room_title TEXT DEFAULT '아기사자 하우스',
  ADD COLUMN IF NOT EXISTS room_theme TEXT DEFAULT 'sky',
  ADD COLUMN IF NOT EXISTS room_mood TEXT DEFAULT 'sleepy',
  ADD COLUMN IF NOT EXISTS favorite_stack TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS guestbook_open BOOLEAN NOT NULL DEFAULT true;

UPDATE public.profiles
SET username = COALESCE(NULLIF(username, ''), split_part(id::text, '-', 1))
WHERE username IS NULL OR username = '';

ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT DEFAULT '',
  admin_only BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view activity types" ON public.activity_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage activity types" ON public.activity_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.activity_types (code, name, points, description, admin_only)
VALUES
  ('attendance', '출석', 10, '모임 출석 시 자동 적립', false),
  ('assignment_submission', '과제 제출', 50, '운영진이 과제 제출 확인 후 지급', true),
  ('open_source_contribution', '오픈소스 기여', 100, '운영진이 기여 확인 후 지급', true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  admin_only = EXCLUDED.admin_only;

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type_id UUID REFERENCES public.activity_types(id) ON DELETE CASCADE NOT NULL,
  reference_key TEXT,
  description TEXT DEFAULT '',
  awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_type_id, reference_key)
);
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view activity events" ON public.activity_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage activity events" ON public.activity_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.friend_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status public.friend_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CONSTRAINT no_self_friend_request CHECK (requester_id <> addressee_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view related friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (
    auth.uid() = requester_id
    OR auth.uid() = addressee_id
    OR status = 'accepted'
  );

CREATE POLICY "Users can create own friend requests" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update related friendships" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TABLE IF NOT EXISTS public.guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT guestbook_content_length CHECK (char_length(content) BETWEEN 1 AND 300)
);
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view guestbook entries" ON public.guestbook_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can write guestbook entries" ON public.guestbook_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own guestbook entries" ON public.guestbook_entries
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.award_activity_points(
  _user_id UUID,
  _activity_code TEXT,
  _reference_key TEXT DEFAULT NULL,
  _description TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _activity public.activity_types%ROWTYPE;
  _existing UUID;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION '관리자만 활동 포인트를 지급할 수 있습니다.';
  END IF;

  SELECT * INTO _activity
  FROM public.activity_types
  WHERE code = _activity_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION '존재하지 않는 활동 타입입니다.';
  END IF;

  SELECT id INTO _existing
  FROM public.activity_events
  WHERE user_id = _user_id
    AND activity_type_id = _activity.id
    AND (
      (_reference_key IS NULL AND reference_key IS NULL)
      OR reference_key = _reference_key
    );

  IF _existing IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', '이미 같은 활동으로 포인트가 지급되었습니다.');
  END IF;

  INSERT INTO public.activity_events (user_id, activity_type_id, reference_key, description, awarded_by)
  VALUES (_user_id, _activity.id, _reference_key, _description, auth.uid());

  PERFORM public.add_points(_user_id, _activity.points, _activity.name, NULL);

  RETURN json_build_object(
    'success', true,
    'message', format('%s +%sP 지급 완료', _activity.name, _activity.points)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_in_attendance(_qr_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _qr RECORD;
  _user_id UUID;
  _existing UUID;
  _attendance_activity public.activity_types%ROWTYPE;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', '로그인이 필요합니다.');
  END IF;

  SELECT * INTO _qr FROM public.attendance_qr WHERE code = _qr_code;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', '유효하지 않은 QR 코드입니다.');
  END IF;

  IF _qr.expires_at < now() THEN
    RETURN json_build_object('success', false, 'message', 'QR 코드가 만료되었습니다.');
  END IF;

  SELECT id INTO _existing FROM public.attendance
  WHERE meeting_id = _qr.meeting_id AND user_id = _user_id;

  IF _existing IS NOT NULL THEN
    RETURN json_build_object('success', false, 'message', '이미 출석 처리되었습니다.');
  END IF;

  SELECT * INTO _attendance_activity
  FROM public.activity_types
  WHERE code = 'attendance';

  INSERT INTO public.attendance (meeting_id, user_id) VALUES (_qr.meeting_id, _user_id);
  PERFORM public.add_points(_user_id, COALESCE(_attendance_activity.points, 10), COALESCE(_attendance_activity.name, '출석'), _qr.meeting_id);

  RETURN json_build_object(
    'success', true,
    'message', format('출석 완료! +%s 포인트', COALESCE(_attendance_activity.points, 10))
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS friendships_updated_at ON public.friendships;
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

ALTER PUBLICATION supabase_realtime ADD TABLE public.points_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
