select count(*)::integer as count from sessions where sessions.ended_at is null
