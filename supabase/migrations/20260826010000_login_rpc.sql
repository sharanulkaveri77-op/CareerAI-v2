-- Allows signing in with a USN: resolves it to the auth email before
-- calling Supabase password sign-in. Security definer so it can read
-- profiles without exposing them to anonymous selects.

create or replace function public.lookup_login_email(p_usn text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.usn is not null
    and lower(p.usn) = lower(trim(p_usn))
  limit 1;
$$;

revoke all on function public.lookup_login_email(text) from public;
grant execute on function public.lookup_login_email(text) to anon, authenticated;
