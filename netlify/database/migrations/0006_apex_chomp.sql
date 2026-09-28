-- Apex Chomp players. Usernames are unique forever (case-insensitive).
-- The 4-digit code is stored only as a scrypt hash.

create table if not exists apex_players (
  id text primary key,
  username text not null,
  username_key text not null,
  pin_hash text not null,
  best_score integer not null default 0,
  worlds_cleared integer not null default 0,
  runs integer not null default 0,
  progress_json text not null default '{}',
  fail_count integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint apex_players_name_len check (char_length(username_key) between 3 and 16),
  constraint apex_players_best check (best_score >= 0),
  constraint apex_players_worlds check (worlds_cleared >= 0 and worlds_cleared <= 8),
  constraint apex_players_runs check (runs >= 0)
);

create unique index if not exists apex_players_username_key_idx on apex_players (username_key);

create index if not exists apex_players_best_idx
  on apex_players (best_score desc, last_seen_at asc);

create table if not exists apex_runs (
  id text primary key,
  player_id text not null references apex_players (id) on delete cascade,
  score integer not null,
  world_index smallint not null,
  world_name text not null,
  outcome text not null,
  created_at timestamptz not null default now(),
  constraint apex_runs_score check (score >= 0 and score <= 9999999),
  constraint apex_runs_world check (world_index >= 0 and world_index <= 7),
  constraint apex_runs_outcome check (outcome in ('over', 'won'))
);

create index if not exists apex_runs_player_idx on apex_runs (player_id, created_at desc);
