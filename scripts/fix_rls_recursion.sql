
-- 1. Create a secure function to get the user role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 2. Drop the problematic recursive policy on users
DROP POLICY IF EXISTS "Admin manage users" ON "public"."users";

-- 3. Recreate the policy using the safe function
CREATE POLICY "Admin manage users" ON "public"."users"
AS PERMISSIVE FOR ALL
TO authenticated
USING (get_user_role_safe() = 'administrador')
WITH CHECK (get_user_role_safe() = 'administrador');

-- 4. Do the same for other tables that might be crashing due to the same check
-- Machinery
DROP POLICY IF EXISTS "Admin machinery all" ON "public"."machinery";
CREATE POLICY "Admin machinery all" ON "public"."machinery"
AS PERMISSIVE FOR ALL TO authenticated
USING (get_user_role_safe() = 'administrador');

DROP POLICY IF EXISTS "Mecanico machinery view" ON "public"."machinery";
CREATE POLICY "Mecanico machinery view" ON "public"."machinery"
AS PERMISSIVE FOR SELECT TO authenticated
USING (get_user_role_safe() = 'mecanico');

DROP POLICY IF EXISTS "Mecanico machinery update" ON "public"."machinery";
CREATE POLICY "Mecanico machinery update" ON "public"."machinery"
AS PERMISSIVE FOR UPDATE TO authenticated
USING (get_user_role_safe() = 'mecanico');

-- Maintenances (assuming similar policies exist or need to be fixed)
-- I'll check maintenances policies first or just apply safe generic fix if I knew the names.
-- For now, fixing users and machinery is the priority as they were explicitly failing in logs.
