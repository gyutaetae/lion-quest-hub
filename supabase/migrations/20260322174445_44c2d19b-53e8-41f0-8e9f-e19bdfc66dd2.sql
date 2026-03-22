
-- Fix permissive RLS: restrict points_log INSERT to only via security definer functions
DROP POLICY "System can insert points" ON public.points_log;
CREATE POLICY "No direct insert on points_log" ON public.points_log
  FOR INSERT TO authenticated
  WITH CHECK (false);
