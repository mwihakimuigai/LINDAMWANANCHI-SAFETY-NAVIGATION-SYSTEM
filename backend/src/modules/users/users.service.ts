import { execute, queryRows } from "../../config/db.js";
import type { AuthUser, UserRole } from "../../types/auth.js";
import { pipelineSchemaService } from "../pipeline/schema.service.js";
import { HttpError } from "../../utils/http.js";

type DbUser = {
  id: number;
  full_name: string;
  email: string;
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

export const usersService = {
  async getById(id: string) {
    await pipelineSchemaService.ensureSchema();

    const result = await queryRows<DbUser>(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    const user = result[0];
    if (!user) throw new HttpError(404, "User not found");
    return mapUser(user);
  },

  async listUsers() {
    await pipelineSchemaService.ensureSchema();

    const result = await queryRows<DbUser>(
      "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200"
    );
    return result.map(mapUser);
  },

  async updateProfile(
    userId: string,
    input: { fullName?: string; phoneNumber?: string | null; emergencyContact?: string | null }
  ) {
    await pipelineSchemaService.ensureSchema();

    await execute(
      `UPDATE users
       SET
        full_name = COALESCE(?, full_name)
       WHERE id = ?`,
      [input.fullName ?? null, userId]
    );
    const result = await queryRows<DbUser>(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const user = result[0];
    if (!user) throw new HttpError(404, "User not found");
    return mapUser(user);
  },

  async updateRole(userId: string, role: UserRole, actorUserId: string) {
    await pipelineSchemaService.ensureSchema();

    if (userId === actorUserId) {
      throw new HttpError(400, "You cannot change your own role");
    }

    await execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return this.getById(userId);
  },

  async deleteUser(userId: string, actorUserId: string) {
    await pipelineSchemaService.ensureSchema();

    if (userId === actorUserId) {
      throw new HttpError(400, "You cannot delete your own account");
    }

    const existing = await queryRows<DbUser>(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (!existing[0]) {
      throw new HttpError(404, "User not found");
    }

    await execute("DELETE FROM users WHERE id = ?", [userId]);
    return { success: true };
  },
};
