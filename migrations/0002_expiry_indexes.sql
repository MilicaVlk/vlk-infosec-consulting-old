CREATE INDEX IF NOT EXISTS challenges_expiry ON challenges(expires);
CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(expires);
