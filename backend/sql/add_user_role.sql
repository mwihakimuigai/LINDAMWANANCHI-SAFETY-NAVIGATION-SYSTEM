SET @role_column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role'
);

SET @alter_sql := IF(
  @role_column_exists = 0,
  "ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'",
  "SELECT 'role column already exists'"
);

PREPARE role_stmt FROM @alter_sql;
EXECUTE role_stmt;
DEALLOCATE PREPARE role_stmt;

UPDATE users
SET role = 'user'
WHERE role IS NULL OR role = '';
