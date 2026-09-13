
-- ============================
-- Trigger for Crosswords table
-- ============================
CREATE TRIGGER trig_update_disk_usage_crosswords
AFTER INSERT OR UPDATE OR DELETE ON Crosswords
FOR EACH ROW EXECUTE FUNCTION update_disk_usage();

-- ============================
-- Trigger for WordLists table
-- ============================
CREATE TRIGGER trig_update_disk_usage_wordlists
AFTER INSERT OR UPDATE OR DELETE ON WordLists
FOR EACH ROW EXECUTE FUNCTION update_disk_usage();

-- ============================
-- Trigger for Images table
-- ============================
CREATE TRIGGER trig_update_disk_usage_images
AFTER INSERT OR UPDATE OR DELETE ON Images
FOR EACH ROW EXECUTE FUNCTION update_disk_usage();

-- ============================
-- Trigger for Books table
-- ============================
CREATE TRIGGER trig_update_disk_usage_books
AFTER INSERT OR UPDATE OR DELETE ON Books
FOR EACH ROW EXECUTE FUNCTION update_disk_usage();

-- ============================
-- Trigger for CustomWords table
-- ============================
CREATE TRIGGER trig_update_disk_usage_customwords
AFTER INSERT OR UPDATE OR DELETE ON CustomWords
FOR EACH ROW EXECUTE FUNCTION update_disk_usage();
