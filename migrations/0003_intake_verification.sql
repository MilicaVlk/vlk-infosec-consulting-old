CREATE TABLE IF NOT EXISTS intake_challenges (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS intake_challenges_expiry ON intake_challenges(expires);
CREATE INDEX IF NOT EXISTS intake_challenges_email ON intake_challenges(email);
CREATE TABLE IF NOT EXISTS intake_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS intake_rate_expiry ON intake_rate_limits(expires);
CREATE TABLE IF NOT EXISTS intake_code_requests (
  key TEXT PRIMARY KEY,
  last_request INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS intake_code_request_expiry ON intake_code_requests(expires);
