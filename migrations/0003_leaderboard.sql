-- Mushroom Run high scores. One row per Better Auth user.
-- user_id is TEXT to match "user"."id" (and the preview 'dev-user' fallback).

create table if not exists mushroom_run_scores (
  user_id text primary key,
  display_name text not null,
  best_score integer not null default 0,
  stage smallint not null default 1,
  updated_at timestamptz not null default now(),
  constraint mushroom_run_scores_score_nonneg check (best_score >= 0),
  constraint mushroom_run_scores_stage check (stage in (1, 2, 3)),
  constraint mushroom_run_scores_name_len check (char_length(btrim(display_name)) between 1 and 24)
);

create index if not exists mushroom_run_scores_best_idx
  on mushroom_run_scores (best_score desc, updated_at asc);
