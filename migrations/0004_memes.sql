-- Public meme wall. Images live as compact JPEG data URLs so the preview
-- (PGLite) and deploy (Neon) both work without object storage.

create table if not exists memes (
  id text primary key,
  user_id text not null,
  creator_name text not null,
  top_text text not null default '',
  bottom_text text not null default '',
  image_data text not null,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  constraint memes_likes_nonneg check (likes >= 0),
  constraint memes_name_len check (char_length(btrim(creator_name)) between 1 and 24),
  constraint memes_image_prefix check (image_data like 'data:image/%'),
  constraint memes_image_len check (char_length(image_data) between 64 and 900000)
);

create index if not exists memes_created_idx on memes (created_at desc);
create index if not exists memes_likes_idx on memes (likes desc, created_at desc);
create index if not exists memes_user_idx on memes (user_id, created_at desc);

create table if not exists meme_likes (
  meme_id text not null references memes(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (meme_id, user_id)
);
