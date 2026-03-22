
-- 1. User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  playlist_url TEXT DEFAULT '',
  level INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create meetings" ON public.meetings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Attendance QR codes
CREATE TABLE public.attendance_qr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance_qr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view qr" ON public.attendance_qr
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can create qr" ON public.attendance_qr
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Attendance records
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, user_id)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view attendance" ON public.attendance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can check in" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6. Points log
CREATE TABLE public.points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view points" ON public.points_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert points" ON public.points_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Function to add points and update profile
CREATE OR REPLACE FUNCTION public.add_points(_user_id UUID, _points INTEGER, _reason TEXT, _ref_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_total INTEGER;
  _new_level INTEGER;
BEGIN
  INSERT INTO public.points_log (user_id, points, reason, reference_id)
  VALUES (_user_id, _points, _reason, _ref_id);

  SELECT COALESCE(SUM(points), 0) INTO _new_total
  FROM public.points_log WHERE user_id = _user_id;

  _new_level := CASE
    WHEN _new_total >= 1000 THEN 5
    WHEN _new_total >= 500 THEN 4
    WHEN _new_total >= 200 THEN 3
    WHEN _new_total >= 50 THEN 2
    ELSE 1
  END;

  UPDATE public.profiles
  SET total_points = _new_total, level = _new_level, updated_at = now()
  WHERE id = _user_id;
END;
$$;

-- 8. Function to handle attendance check-in with points
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

  INSERT INTO public.attendance (meeting_id, user_id) VALUES (_qr.meeting_id, _user_id);
  PERFORM public.add_points(_user_id, 10, '출석 체크', _qr.meeting_id);

  RETURN json_build_object('success', true, 'message', '출석 완료! +10 포인트');
END;
$$;

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
