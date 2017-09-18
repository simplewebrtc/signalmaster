DELETE FROM events WHERE (
    created_at::timestamp < ${now}::timestamp with time zone - ${interval} * interval '1 day'
    AND (
        type = 'peer_session_stats'
        OR
        type = 'peer_session_ice_stats'
    )
)
