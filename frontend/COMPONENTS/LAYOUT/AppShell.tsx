import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useAppContext } from "../../CONTEXT/AppContext";
import { authService } from "../../SERVICES/authService";
import { workspaceStorage } from "../../SERVICES/apiClient";

const userTabs = [
  { href: "/", label: "Dashboard", icon: "DB" },
  { href: "/map", label: "Map", icon: "MP" },
  { href: "/nearby", label: "Nearby Services", icon: "NS" },
  { href: "/navigation", label: "Navigation", icon: "NV" },
  { href: "/alerts", label: "Alerts", icon: "AL" },
  { href: "/sos", label: "SOS", icon: "SO" },
  { href: "/guide", label: "Crime Guide", icon: "GD" },
  { href: "/reports", label: "Reports", icon: "RP" },
];

const adminTabs = [
  { href: "/admin", label: "Admin Dashboard", icon: "AD" },
  { href: "/admin/analytics", label: "Analytics", icon: "AN" },
  { href: "/admin/reports", label: "Admin Reports", icon: "AR" },
  { href: "/admin/users", label: "User Management", icon: "US" },
  { href: "/admin/alerts", label: "Alert Center", icon: "AC" },
  { href: "/admin/settings", label: "Settings", icon: "ST" },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { locationPermission, requestLocationSharing, denyLocationSharing, user } = useAppContext();
  const workspaceMode = workspaceStorage.getMode();
  const tabs = user?.role === "admin" && workspaceMode === "admin" ? adminTabs : userTabs;

  const onLogout = () => {
    authService.logout();
    window.location.href = "/";
  };

  return (
    <div className="lm-shell">
      <aside className="lm-shell-nav">
        <div className="lm-brand-top">
          <div className="lm-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <defs>
                <linearGradient id="lmShield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1f3d77" />
                  <stop offset="100%" stopColor="#0f1f3f" />
                </linearGradient>
              </defs>
              <path d="M32 4l22 8v16c0 15-9 25-22 32C19 53 10 43 10 28V12l22-8z" fill="url(#lmShield)" stroke="#8bb6ff" strokeWidth="2" />
              <rect x="18" y="18" width="28" height="8" rx="3" fill="#101010" />
              <rect x="18" y="27" width="28" height="4" rx="2" fill="#f1f5f9" />
              <rect x="18" y="32" width="28" height="12" rx="3" fill="#b91c1c" />
              <rect x="18" y="45" width="28" height="4" rx="2" fill="#f1f5f9" />
              <rect x="18" y="50" width="28" height="6" rx="2" fill="#15803d" />
              <circle cx="32" cy="38" r="7" fill="#0a152f" stroke="#f8fafc" strokeWidth="1.5" />
              <path d="M32 30v16M24 38h16" stroke="#f8fafc" strokeWidth="1.3" />
            </svg>
          </div>
          <div>
            <h2>LINDAMWANANCHI</h2>
            <p className="lm-nav-subtitle">SAFETY NAVIGATION SYSTEM</p>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => {
            const active = tab.href === "/"
              ? router.pathname === "/"
              : tab.href === "/admin"
                ? router.pathname === "/admin"
                : router.pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
                <span className="lm-nav-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
        <button type="button" className="lm-logout-button" onClick={onLogout}>Logout</button>
      </aside>
      <section className="lm-shell-main">
        {locationPermission === "prompt" ? (
          <div className="lm-location-prompt">
            <div>
              <strong>Share live location with LINDAMWANANCHI?</strong>
              <p>This enables live moving map dot, safer routing, and nearby risk alerts.</p>
            </div>
            <div className="lm-location-actions">
              <button type="button" onClick={requestLocationSharing}>Allow</button>
              <button type="button" className="secondary" onClick={denyLocationSharing}>Deny</button>
            </div>
          </div>
        ) : null}
        {locationPermission === "denied" ? (
          <div className="lm-location-prompt lm-location-denied">
            <div>
              <strong>Live location is off</strong>
              <p>Turn it on any time to improve map accuracy and safe-route suggestions.</p>
            </div>
            <div className="lm-location-actions">
              <button type="button" onClick={requestLocationSharing}>Enable location</button>
            </div>
          </div>
        ) : null}
        {children}
      </section>
    </div>
  );
};
