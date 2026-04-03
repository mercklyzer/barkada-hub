CREATE TABLE IF NOT EXISTS werewolf_players (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID        NOT NULL REFERENCES werewolf_rooms(id) ON DELETE CASCADE,
  player_id   TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  role        TEXT        CHECK (role IN ('villager','werewolf','seer','doctor')),
  is_alive    BOOLEAN     NOT NULL DEFAULT true,
  is_host     BOOLEAN     NOT NULL DEFAULT false,
  seat_order  INTEGER     NOT NULL DEFAULT 0,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE werewolf_players ADD CONSTRAINT uq_werewolf_players_room_player
  UNIQUE (room_id, player_id);

ALTER TABLE werewolf_players ADD CONSTRAINT uq_werewolf_players_room_name
  UNIQUE (room_id, name);

CREATE INDEX IF NOT EXISTS idx_werewolf_players_room ON werewolf_players (room_id);

-- Full replica identity so realtime filters work on UPDATE/DELETE
ALTER TABLE werewolf_players REPLICA IDENTITY FULL;

ALTER TABLE werewolf_players ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'werewolf_players' AND policyname = 'Allow public read of werewolf players'
  ) THEN
    -- Role column is readable here; API routes never expose it to clients
    CREATE POLICY "Allow public read of werewolf players"
      ON werewolf_players FOR SELECT
      USING (true);
  END IF;
END
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE werewolf_players;
