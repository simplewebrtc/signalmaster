SELECT
    count(*)::integer as config_request_count,
    count(used_turn OR NULL)::integer as used_turn_count,
    count(activated OR NULL)::integer as session_connected_count,
    sum(CASE WHEN type = 'desktop' and activated = true THEN 1 ELSE 0 END) as web_count,
    sum(CASE WHEN type = 'mobile' and activated = true THEN 1 ELSE 0 END) as mobile_count,
    max(created_at) as last_activity,
    sum(CASE
      WHEN ended_at IS NULL THEN 1
      ELSE 0
    END) as live,
    sum(CASE
      WHEN age(now(), created_at) < interval '1 day' THEN 1
      ELSE 0
    END) as one_day
FROM
    sessions
WHERE
    age(now(), created_at) < interval ${interval};
