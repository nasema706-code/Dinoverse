-- The API connection is the read-only login. Let it save hunters and scores.

grant select, insert, update, delete on all tables in schema public to netlifydb_readonly;
grant usage, select on all sequences in schema public to netlifydb_readonly;
