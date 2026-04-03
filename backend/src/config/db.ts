import mysql from "mysql2/promise";
import type { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { env } from "./env.js";

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
});

export async function queryRows<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(text, params as never[]);
  return rows as unknown as T[];
}

export async function execute(text: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(text, params as never[]);
  return result;
}

export async function rawQuery<T = unknown>(
  text: string,
  params: unknown[] = []
): Promise<[T, FieldPacket[]]> {
  return pool.query(text, params as never[]) as Promise<[T, FieldPacket[]]>;
}

export async function closePool() {
  await pool.end();
}

export async function pingDatabase() {
  await pool.query("SELECT 1");
}
