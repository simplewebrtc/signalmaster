UPDATE sessions set ended_at = now() WHERE ended_at IS NULL;
