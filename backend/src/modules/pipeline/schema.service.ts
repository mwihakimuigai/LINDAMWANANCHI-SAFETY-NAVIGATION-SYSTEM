import { execute, queryRows } from "../../config/db.js";
import { env } from "../../config/env.js";

type InformationSchemaRow = {
  count: number;
};

let schemaReady = false;
let schemaEnsuring: Promise<void> | null = null;

const hasColumn = async (tableName: string, columnName: string) => {
  const rows = await queryRows<InformationSchemaRow>(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [env.DB_NAME, tableName, columnName]
  );
  return Number(rows[0]?.count ?? 0) > 0;
};

const hasIndex = async (tableName: string, indexName: string) => {
  const rows = await queryRows<InformationSchemaRow>(
    `SELECT COUNT(*) AS count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [env.DB_NAME, tableName, indexName]
  );
  return Number(rows[0]?.count ?? 0) > 0;
};

export const pipelineSchemaService = {
  async ensureSchema() {
    if (schemaReady) return;
    if (schemaEnsuring) {
      await schemaEnsuring;
      return;
    }

    schemaEnsuring = (async () => {
    await execute(
      `CREATE TABLE IF NOT EXISTS raw_articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(512) NOT NULL,
        description TEXT NULL,
        url VARCHAR(800) NULL,
        published_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await execute(
      `CREATE TABLE IF NOT EXISTS street_lights (
        id INT PRIMARY KEY AUTO_INCREMENT,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        status ENUM('functional','broken') NOT NULL DEFAULT 'functional',
        source VARCHAR(120) NULL,
        source_ref VARCHAR(120) NULL,
        condition_label VARCHAR(120) NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    if (!(await hasColumn("users", "role"))) {
      await execute("ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'");
    }
    if (!(await hasColumn("users", "username"))) {
      await execute("ALTER TABLE users ADD COLUMN username VARCHAR(120) NULL");
    }

    if (!(await hasColumn("incidents", "title"))) {
      await execute("ALTER TABLE incidents ADD COLUMN title VARCHAR(255) NULL");
    }
    if (!(await hasColumn("incidents", "location_name"))) {
      await execute("ALTER TABLE incidents ADD COLUMN location_name VARCHAR(255) NULL");
    }
    if (!(await hasColumn("incidents", "crime_type"))) {
      await execute("ALTER TABLE incidents ADD COLUMN crime_type VARCHAR(80) NULL");
    }
    if (!(await hasColumn("incidents", "severity"))) {
      await execute("ALTER TABLE incidents ADD COLUMN severity ENUM('low','medium','high') DEFAULT 'medium'");
    }
    if (!(await hasColumn("incidents", "source"))) {
      await execute("ALTER TABLE incidents ADD COLUMN source ENUM('news','user') DEFAULT 'user'");
    }
    if (!(await hasColumn("incidents", "created_at"))) {
      await execute("ALTER TABLE incidents ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    if (!(await hasColumn("street_lights", "source"))) {
      await execute("ALTER TABLE street_lights ADD COLUMN source VARCHAR(120) NULL");
    }
    if (!(await hasColumn("street_lights", "source_ref"))) {
      await execute("ALTER TABLE street_lights ADD COLUMN source_ref VARCHAR(120) NULL");
    }
    if (!(await hasColumn("street_lights", "condition_label"))) {
      await execute("ALTER TABLE street_lights ADD COLUMN condition_label VARCHAR(120) NULL");
    }
    if (!(await hasColumn("street_lights", "notes"))) {
      await execute("ALTER TABLE street_lights ADD COLUMN notes TEXT NULL");
    }

    if (!(await hasIndex("incidents", "idx_incidents_created_at"))) {
      await execute("CREATE INDEX idx_incidents_created_at ON incidents(created_at)");
    }
    if (!(await hasIndex("incidents", "idx_incidents_severity_src"))) {
      await execute("CREATE INDEX idx_incidents_severity_src ON incidents(severity, source)");
    }
    if (!(await hasIndex("raw_articles", "idx_raw_articles_published_at"))) {
      await execute("CREATE INDEX idx_raw_articles_published_at ON raw_articles(published_at)");
    }
    if (!(await hasIndex("street_lights", "idx_street_lights_lat_lng"))) {
      await execute("CREATE INDEX idx_street_lights_lat_lng ON street_lights(latitude, longitude)");
    }

    if (await hasColumn("incidents", "source")) {
      await execute("ALTER TABLE incidents MODIFY COLUMN source ENUM('news','user') DEFAULT 'user'");
    }
    if (await hasColumn("users", "role")) {
      await execute("ALTER TABLE users MODIFY COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'");
      await execute("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
    }
      schemaReady = true;
    })();

    try {
      await schemaEnsuring;
    } finally {
      schemaEnsuring = null;
    }
  },
};
