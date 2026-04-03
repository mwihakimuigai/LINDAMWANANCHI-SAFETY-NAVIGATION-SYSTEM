import { execute, queryRows } from "../../config/db.js";
import { HttpError } from "../../utils/http.js";

type EmergencyContact = {
  id: number;
  user_id: number;
  contact_name: string;
  contact_phone: string;
  relationship: string;
  created_at: string;
};

const ensureTables = async () => {
  await execute(
    `CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      contact_name VARCHAR(120) NOT NULL,
      contact_phone VARCHAR(40) NOT NULL,
      relationship VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    `CREATE TABLE IF NOT EXISTS sos_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      contact_phone VARCHAR(40) NOT NULL,
      latitude DECIMAL(10,7) NULL,
      longitude DECIMAL(10,7) NULL,
      message TEXT NULL,
      triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
};

export const sosService = {
  async setEmergencyContact(input: {
    userId: number;
    contactName: string;
    contactPhone: string;
    relationship: string;
  }) {
    await ensureTables();

    const existing = await queryRows<EmergencyContact>(
      "SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [input.userId]
    );

    if (existing[0]) {
      await execute(
        "UPDATE emergency_contacts SET contact_name = ?, contact_phone = ?, relationship = ? WHERE id = ?",
        [input.contactName, input.contactPhone, input.relationship, existing[0].id]
      );
    } else {
      await execute(
        "INSERT INTO emergency_contacts (user_id, contact_name, contact_phone, relationship) VALUES (?, ?, ?, ?)",
        [input.userId, input.contactName, input.contactPhone, input.relationship]
      );
    }

    const saved = await queryRows<EmergencyContact>(
      "SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [input.userId]
    );

    return saved[0];
  },

  async getEmergencyContact(userId: number) {
    await ensureTables();
    const result = await queryRows<EmergencyContact>(
      "SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [userId]
    );
    return result[0] ?? null;
  },

  async trigger(input: { userId: number; latitude?: number; longitude?: number; message?: string }) {
    await ensureTables();

    const contact = await this.getEmergencyContact(input.userId);
    if (!contact) throw new HttpError(404, "No emergency contact set. Save one first.");

    await execute(
      `INSERT INTO sos_events (user_id, contact_phone, latitude, longitude, message)
       VALUES (?, ?, ?, ?, ?)`,
      [input.userId, contact.contact_phone, input.latitude ?? null, input.longitude ?? null, input.message ?? "Emergency SOS triggered"]
    );

    return {
      success: true,
      contactName: contact.contact_name,
      contactPhone: contact.contact_phone,
      instruction: "Dial initiated from client-side via tel:// link.",
    };
  },
};
