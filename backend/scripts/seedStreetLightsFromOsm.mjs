import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const bbox = {
  south: -1.35,
  west: 36.75,
  north: -1.22,
  east: 36.9,
};

const overpassQuery = `[out:json][timeout:90];node["highway"="street_lamp"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});out body;`;
const cacheFile = path.resolve(__dirname, "osm-street-lights-nairobi.json");

const normalizeStatus = (tags = {}) => {
  const operationalStatus = String(tags.operational_status ?? "").toLowerCase();
  const condition = String(tags.condition ?? "").toLowerCase();
  const workingCount = Number(tags["light:count_functioning"] ?? Number.NaN);

  const brokenHints = [
    "non-operational",
    "non operational",
    "not_installed",
    "not installed",
    "not instaled",
    "dilapidated",
  ];

  if (brokenHints.some((hint) => operationalStatus.includes(hint) || condition.includes(hint))) {
    return "broken";
  }

  if (Number.isFinite(workingCount) && workingCount <= 0) {
    return "broken";
  }

  return "functional";
};

const conditionLabel = (tags = {}) =>
  String(tags.operational_status ?? tags.condition ?? tags["light:lit"] ?? "unspecified");

const notes = (tags = {}) => {
  const parts = [
    tags.name ? `name=${tags.name}` : "",
    tags["security:light_type"] ? `type=${tags["security:light_type"]}` : "",
    tags["light:count"] ? `lights=${tags["light:count"]}` : "",
    tags["light:count_functioning"] ? `working=${tags["light:count_functioning"]}` : "",
    tags.operator ? `operator=${tags.operator}` : "",
    tags["operator:type"] ? `operator_type=${tags["operator:type"]}` : "",
    tags.website ? `website=${tags.website}` : "",
  ].filter(Boolean);

  return parts.join("; ");
};

const main = async () => {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error("Database environment variables are missing in BACKEND/.env");
  }

  const payload = await (async () => {
    try {
      const cached = await fs.readFile(cacheFile, "utf8");
      return JSON.parse(cached);
    } catch {
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      );
      if (!response.ok) {
        throw new Error(`Overpass request failed with status ${response.status}`);
      }

      const freshPayload = await response.json();
      await fs.writeFile(cacheFile, JSON.stringify(freshPayload, null, 2));
      return freshPayload;
    }
  })();
  const rows = Array.isArray(payload.elements) ? payload.elements : [];

  const streetLights = rows
    .filter((row) => typeof row.lat === "number" && typeof row.lon === "number")
    .map((row) => ({
      latitude: row.lat,
      longitude: row.lon,
      status: normalizeStatus(row.tags),
      source: "OpenStreetMap/Overpass",
      sourceRef: String(row.id),
      conditionLabel: conditionLabel(row.tags),
      notes: notes(row.tags),
    }));

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS street_lights (
        id INT PRIMARY KEY AUTO_INCREMENT,
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        status ENUM('functional','broken') NOT NULL DEFAULT 'functional',
        source VARCHAR(120) NULL,
        source_ref VARCHAR(120) NULL,
        condition_label VARCHAR(120) NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute("DELETE FROM street_lights WHERE source = ?", ["OpenStreetMap/Overpass"]);

    for (const light of streetLights) {
      await connection.execute(
        `INSERT INTO street_lights (latitude, longitude, status, source, source_ref, condition_label, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          light.latitude,
          light.longitude,
          light.status,
          light.source,
          light.sourceRef,
          light.conditionLabel,
          light.notes || null,
        ]
      );
    }

    console.log(
      JSON.stringify(
        {
          imported: streetLights.length,
          source: "OpenStreetMap via Overpass API",
          bbox,
        },
        null,
        2
      )
    );
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
