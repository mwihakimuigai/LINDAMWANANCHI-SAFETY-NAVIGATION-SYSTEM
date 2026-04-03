import type { AppProps } from "next/app";
import { AppProvider } from "../CONTEXT/AppContext";
import "leaflet/dist/leaflet.css";
import "../STYLES/globals.css";
import { AppShell } from "../COMPONENTS/LAYOUT/AppShell";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authStorage, workspaceStorage } from "../SERVICES/apiClient";
import LoginPage from "./login";
import { useAppContext } from "../CONTEXT/AppContext";

const AuthenticatedApp = ({ Component, pageProps }: Pick<AppProps, "Component" | "pageProps">) => {
  const router = useRouter();
  const { user, userLoading } = useAppContext();
  const isAdminRoute = router.pathname === "/admin" || router.pathname.startsWith("/admin/");
  const workspaceMode = workspaceStorage.getMode();

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      authStorage.clearToken();
      void router.replace("/");
      return;
    }

    if (isAdminRoute && user.role !== "admin") {
      void router.replace("/");
      return;
    }

    if (workspaceMode === "admin" && user.role === "admin" && !isAdminRoute) {
      void router.replace("/admin");
      return;
    }

    if (workspaceMode === "user" && isAdminRoute) {
      void router.replace("/");
    }
  }, [isAdminRoute, router, user, userLoading, workspaceMode]);

  if (userLoading) {
    return (
      <main className="lm-auth-page">
        <section className="lm-panel">
          <p className="lm-meta">Loading your session...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (isAdminRoute && user.role !== "admin") {
    return (
      <main className="lm-dashboard">
        <section className="lm-panel">
          <h1>Access Denied</h1>
          <p className="lm-meta">This page is only available to administrators.</p>
        </section>
      </main>
    );
  }

  if (workspaceMode === "admin" && !isAdminRoute && user.role === "admin") {
    return (
      <main className="lm-dashboard">
        <section className="lm-panel">
          <p className="lm-meta">Redirecting to the admin workspace...</p>
        </section>
      </main>
    );
  }

  if (workspaceMode === "user" && isAdminRoute) {
    return (
      <main className="lm-dashboard">
        <section className="lm-panel">
          <p className="lm-meta">Redirecting to the user workspace...</p>
        </section>
      </main>
    );
  }

  return (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const token = authStorage.getToken();
      const hasToken = token.trim().length > 0;
      setAuthenticated(hasToken);
      setReady(true);

      if (!hasToken && router.pathname !== "/") {
        void router.replace("/");
        return;
      }

      if (hasToken && router.pathname === "/login") {
        void router.replace("/");
      }
    };

    syncAuth();
    window.addEventListener("focus", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [router.pathname]);

  if (!ready) {
    return (
      <main className="lm-auth-page">
        <section className="lm-panel">
          <p className="lm-meta">Loading system...</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <AuthenticatedApp Component={Component} pageProps={pageProps} />
    </AppProvider>
  );
}
