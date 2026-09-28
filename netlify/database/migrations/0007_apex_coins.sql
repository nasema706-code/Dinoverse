-- Chomp Coins are spend-only. They are credited after a verified Stripe payment.

alter table apex_players add column if not exists chomp_coins integer not null default 0;

alter table apex_players drop constraint if exists apex_players_coins;
alter table apex_players add constraint apex_players_coins check (chomp_coins >= 0);

create table if not exists apex_coin_orders (
  id text primary key,
  player_id text not null references apex_players (id) on delete cascade,
  pack_id text not null,
  coins integer not null,
  amount integer not null,
  currency text not null,
  created_at timestamptz not null default now(),
  constraint apex_coin_orders_coins check (coins > 0),
  constraint apex_coin_orders_amount check (amount > 0)
);

create index if not exists apex_coin_orders_player_idx on apex_coin_orders (player_id, created_at desc);

create table if not exists apex_powerups (
  player_id text not null references apex_players (id) on delete cascade,
  power_id text not null,
  charges integer not null default 0,
  primary key (player_id, power_id),
  constraint apex_powerups_charges check (charges >= 0)
);
