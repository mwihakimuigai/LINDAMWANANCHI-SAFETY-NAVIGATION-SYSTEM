import { useState } from "react";
import { AdminMetricCard, AdminPageHeader, AdminTable } from "../../COMPONENTS/ADMIN/AdminKit";
import { useAdminData } from "../../HOOKS/useAdminData";
import { usersService } from "../../SERVICES/usersService";

export default function AdminUsersPage() {
  const { analytics, users, setUsers, loading, error } = useAdminData(true);
  const [status, setStatus] = useState("");

  const updateRole = async (userId: string, role: "user" | "admin") => {
    await usersService.updateUserRole(userId, role);
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
    setStatus("User role updated successfully.");
  };

  const deleteUser = async (userId: string) => {
    await usersService.deleteUser(userId);
    setUsers((current) => current.filter((user) => user.id !== userId));
    setStatus("User removed successfully.");
  };

  if (loading) {
    return <main className="lm-dashboard"><section className="lm-panel"><p className="lm-meta">Loading users...</p></section></main>;
  }

  return (
    <main className="lm-dashboard lm-admin-page-wrap">
      <AdminPageHeader
        title="User Management"
        subtitle={status || error || "Promote, demote, review, and clean up accounts from one place."}
      />

      <section className="lm-admin-metrics-grid">
        <AdminMetricCard label="All Users" value={users.length} hint="Accounts returned from the database" />
        <AdminMetricCard label="Admin Accounts" value={users.filter((user) => user.role === "admin").length} hint="Privileged users" tone="warning" />
        <AdminMetricCard label="Standard Users" value={users.filter((user) => user.role === "user").length} hint="Regular platform users" tone="success" />
        <AdminMetricCard label="Platform Total" value={analytics?.users ?? users.length} hint="Analytics summary value" />
      </section>

      <section className="lm-admin-dashboard-grid single">
        <section className="lm-panel">
          <div className="lm-admin-panel-head">
            <h3>Accounts</h3>
          </div>
          <div className="lm-reports-list">
            {users.map((user) => (
              <article key={user.id} className="lm-admin-user-row">
                <div>
                  <strong>{user.displayName}</strong>
                  <p className="lm-meta">{user.email || "Email not available"} • {user.role}</p>
                </div>
                <div className="lm-admin-actions">
                  <button type="button" onClick={() => updateRole(user.id, user.role === "admin" ? "user" : "admin")}>
                    Make {user.role === "admin" ? "User" : "Admin"}
                  </button>
                  <button type="button" className="secondary" onClick={() => deleteUser(user.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <AdminTable
          title="Role Directory"
          columns={["Name", "Email", "Role"]}
          rows={users.map((user) => [user.displayName, user.email || "-", user.role])}
        />
      </section>
    </main>
  );
}
