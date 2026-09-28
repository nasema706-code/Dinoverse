-- Per-user explorer bag (guide, shards, districts). Scoped by Better Auth user id.
-- user_id is TEXT to match "user"."id" (and the preview 'dev-user' fallback).

create table if not exists dinoverse_saves (
  user_id text primary key,
  character_id text not null default 'rex',
  collected jsonb not null default '[]'::jsonb,
  visited jsonb not null default '[]'::jsonb,
  quest_done boolean not null default false,
  has_onboarded boolean not null default false,
  updated_at timestamptz not null default now()
);
