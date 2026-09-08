-- Temporary Floor pass: unique runner name + hashed Dino Floor key.
-- user id is TEXT so mushroom_run_scores.user_id can point at a pass.

create table if not exists floor_passes (
  id text primary key,
  name text not null,
  name_key text not null,
  key_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint floor_passes_name_len check (char_length(btrim(name)) between 3 and 20)
);

create unique index if not exists floor_passes_name_key_idx on floor_passes (name_key);
