import { execute, queryRows } from "../../config/db.js";
import type { AuthUser, UserRole } from "../../types/auth.js";
import { pipelineSchemaService } from "../pipeline/schema.service.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { HttpError } from "../../utils/http.js";
import { signJwt } from "../../utils/jwt.js";

type DbUser = {
  id: number;
  full_name: string;
  email: string;
  username: string | null;
  password: string;
  role: UserRole;
  created_at: string;
};

const mapUser = (user: DbUser): AuthUser => ({
  id: String(user.id),
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  phoneNumber: null,
  emergencyContact: null,
  createdAt: user.created_at,
});

const slugifyUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "user";

export const authService = {
  async register(input: {
    fullName: string;
    email: string;
    password: string;
    username?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    role?: UserRole;
  }) {
    await pipelineSchemaService.ensureSchema();

    const normalizedEmail = input.email.toLowerCase();
    const requestedUsername = input.username?.trim().toLowerCase() || slugifyUsername(normalizedEmail.split("@")[0] ?? input.fullName);
    const existing = await queryRows<DbUser>(
      "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
      [normalizedEmail, requestedUsername]
    );
    if (existing.length) {
      throw new HttpError(409, "User with this email or username already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const insert = await execute(
      `INSERT INTO users (
        full_name, email, username, password, role, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [input.fullName, normalizedEmail, requestedUsername, passwordHash, input.role ?? "user"]
    );

    const created = await queryRows<DbUser>(
      "SELECT id, full_name, email, username, password, role, created_at FROM users WHERE id = ? LIMIT 1",
      [insert.insertId]
    );
    const user = mapUser(created[0]);
    const token = signJwt({ userId: String(user.id), email: user.email, role: user.role });
    return { user, token };
  },

  async login(input: { identifier: string; password: string }) {
    await pipelineSchemaService.ensureSchema();

    const normalized = input.identifier.trim().toLowerCase();
    const result = await queryRows<DbUser>(
      "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
      [normalized, normalized]
    );
    const found = result[0];
    if (!found) {
      throw new HttpError(401, "Invalid credentials");
    }

    const matches = await comparePassword(input.password, found.password);
    if (!matches) {
      throw new HttpError(401, "Invalid credentials");
    }

    const user = mapUser(found);
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    return { user, token };
  },
};
