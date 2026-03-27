-- Create the games table
CREATE TABLE IF NOT EXISTS canasta_games (
  room_code   text        PRIMARY KEY,
  state       jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE canasta_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON canasta_games
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE canasta_games;
