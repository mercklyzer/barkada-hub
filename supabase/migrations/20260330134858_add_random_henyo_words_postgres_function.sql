DROP FUNCTION IF EXISTS random_active_henyo_words(integer, text);

CREATE OR REPLACE FUNCTION random_active_henyo_words(limit_count integer, p_category text DEFAULT NULL)
RETURNS SETOF henyo_words
LANGUAGE SQL
AS $$
  SELECT *
  FROM henyo_words
  WHERE is_active = true
    AND (p_category IS NULL OR category = p_category)
  ORDER BY RANDOM()
  LIMIT limit_count;
$$;
