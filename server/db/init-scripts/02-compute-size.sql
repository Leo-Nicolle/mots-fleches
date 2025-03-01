-- ============================
-- Function to calculate disk usage for a user or a group
-- ============================
CREATE OR REPLACE FUNCTION calculate_disk_usage(id INTEGER, is_group BOOLEAN DEFAULT FALSE) RETURNS BIGINT AS $$
DECLARE
    total_size BIGINT := 0;
BEGIN
    -- Calculate the size of crosswords (grids)
    SELECT COALESCE(SUM(pg_column_size(content)), 0) INTO total_size
    FROM Crosswords WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- Calculate the size of word lists
    SELECT total_size + COALESCE(SUM(pg_column_size(words)), 0) INTO total_size
    FROM WordLists WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- Calculate the size of images (if stored as BLOB or URL)
    SELECT total_size + COALESCE(SUM(pg_column_size(url)), 0) INTO total_size
    FROM Images WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- Calculate the size of books
    SELECT total_size + COALESCE(SUM(pg_column_size(grid_ids)), 0) INTO total_size
    FROM Books WHERE (user_id = id AND NOT is_group) OR (group_id = id AND is_group);

    -- Calculate the size of custom words
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

-- ============================
-- Function to trigger disk usage update
-- ============================
CREATE OR REPLACE FUNCTION update_disk_usage() RETURNS TRIGGER AS $$
BEGIN
    -- If the operation affects a user
    IF (NEW.user_id IS NOT NULL) THEN
        PERFORM calculate_disk_usage(NEW.user_id, FALSE);
    ELSIF (OLD.user_id IS NOT NULL) THEN
        PERFORM calculate_disk_usage(OLD.user_id, FALSE);
    END IF;

    -- If the operation affects a group
    IF (NEW.group_id IS NOT NULL) THEN
        PERFORM calculate_disk_usage(NEW.group_id, TRUE);
    ELSIF (OLD.group_id IS NOT NULL) THEN
        PERFORM calculate_disk_usage(OLD.group_id, TRUE);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
