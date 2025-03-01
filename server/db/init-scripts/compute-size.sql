CREATE OR REPLACE FUNCTION compute_disk_usage(id INTEGER, is_group BOOLEAN DEFAULT FALSE) RETURNS BIGINT AS $$
DECLARE
    total_size BIGINT := 0;
BEGIN
    -- compute the size of crosswords (grids)
    SELECT COALESCE(SUM(pg_column_size(content)), 0) INTO total_size
    FROM Crosswords WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- compute the size of word lists
    SELECT total_size + COALESCE(SUM(pg_column_size(words)), 0) INTO total_size
    FROM WordLists WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- compute the size of images (if stored as BLOB or URL)
    SELECT total_size + COALESCE(SUM(pg_column_size(url)), 0) INTO total_size
    FROM Images WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- compute the size of books
    SELECT total_size + COALESCE(SUM(pg_column_size(grid_ids)), 0) INTO total_size
    FROM Books WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- compute the size of custom words
    SELECT total_size + COALESCE(SUM(pg_column_size(definition) + pg_column_size(word)), 0) INTO total_size
    FROM CustomWords WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- Update the disk_usage field in either Users or Groups table
    IF is_group THEN
        UPDATE Groups SET disk_usage = total_size WHERE id = id;
    ELSE
        UPDATE Users SET disk_usage = total_size WHERE id = id;
    END IF;

    RETURN total_size;
END;
$$ LANGUAGE plpgsql;
