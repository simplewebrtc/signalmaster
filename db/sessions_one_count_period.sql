select count(*)::integer as count from sessions where sessions.created_at > ${ts}::timestamp with time zone - 1 * interval ${interval};
