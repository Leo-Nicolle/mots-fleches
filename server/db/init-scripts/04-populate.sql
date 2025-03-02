INSERT INTO Tiers (name, price, max_users, max_grids, max_custom_words, max_disk_usage, features)
VALUES
    ('Free', 0.00, 1, 10, 100, 104857600, '{}'),
    ('Pro', 15, 5, 50, 500, 524288000, '{"backup": "daily"}'),
    ('Enterprise', 50, 50, 500, 5000, 1073741824, '{ "backup": "hourly"}');

-- Verify the insertion
SELECT * FROM Tiers;