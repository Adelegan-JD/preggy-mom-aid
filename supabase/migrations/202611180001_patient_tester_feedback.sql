-- Patient tester feedback only. This is not a clinical-record schema.
create table if not exists public.feedback_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.feedback_reviewers enable row level security;
revoke all on table public.feedback_reviewers from anon;
revoke all on table public.feedback_reviewers from authenticated;
grant select on table public.feedback_reviewers to authenticated;
create policy "Reviewers can read their own reviewer grant"
  on public.feedback_reviewers for select to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.tester_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  area text not null check (char_length(area) between 1 and 80),
  comments text not null check (char_length(comments) between 1 and 2500),
  created_at timestamptz not null default now()
);
create index if not exists tester_feedback_created_at_idx on public.tester_feedback(created_at desc);
create index if not exists tester_feedback_user_id_idx on public.tester_feedback(user_id);
alter table public.tester_feedback enable row level security;
revoke all on table public.tester_feedback from anon;
revoke all on table public.tester_feedback from authenticated;
grant insert, select on table public.tester_feedback to authenticated;

create policy "Testers can submit feedback for themselves"
  on public.tester_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Testers can read their own feedback"
  on public.tester_feedback for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Approved feedback reviewers can read feedback"
  on public.tester_feedback for select to authenticated
  using (
    exists (
      select 1 from public.feedback_reviewers
      where feedback_reviewers.user_id = (select auth.uid())
    )
  );
