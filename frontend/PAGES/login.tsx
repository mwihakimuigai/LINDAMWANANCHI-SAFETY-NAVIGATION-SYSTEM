import { useState } from "react";
import { authService } from "../SERVICES/authService";

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [busy, setBusy] = useState<"login" | "register" | "admin" | "">("");

  const onLogin = async (adminOnly = false) => {
    try {
      setBusy(adminOnly ? "admin" : "login");
      setRegisterStatus("");
      const result = await authService.login({ identifier: loginIdentifier, password: loginPassword }, adminOnly ? "admin" : "user");
      if (adminOnly && result.user.role !== "admin") {
        setLoginStatus("These credentials are valid, but this account is not an administrator account.");
        return;
      }
      setLoginStatus("Login successful. Redirecting...");
      window.location.replace(adminOnly ? "/admin" : "/");
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : "Login failed. Check your credentials.");
    } finally {
      setBusy("");
    }
  };

  const onRegister = async () => {
    try {
      setBusy("register");
      setLoginStatus("");
      const result = await authService.register({ fullName, email: registerEmail, password: registerPassword });
      setRegisterStatus("Account created successfully. Redirecting...");
      window.location.replace("/");
    } catch (error) {
      setRegisterStatus(error instanceof Error ? error.message : "Registration failed. Try another email.");
    } finally {
      setBusy("");
    }
  };

  return (
    <main className="lm-auth-page lm-auth-screen">
      <section className="lm-auth-hero">
        <div className="lm-auth-brand">
          <div className="lm-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <defs>
                <linearGradient id="loginShield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1f3d77" />
                  <stop offset="100%" stopColor="#0f1f3f" />
                </linearGradient>
              </defs>
              <path d="M32 4l22 8v16c0 15-9 25-22 32C19 53 10 43 10 28V12l22-8z" fill="url(#loginShield)" stroke="#8bb6ff" strokeWidth="2" />
              <rect x="18" y="18" width="28" height="8" rx="3" fill="#101010" />
              <rect x="18" y="27" width="28" height="4" rx="2" fill="#f1f5f9" />
              <rect x="18" y="32" width="28" height="12" rx="3" fill="#b91c1c" />
              <rect x="18" y="45" width="28" height="4" rx="2" fill="#f1f5f9" />
              <rect x="18" y="50" width="28" height="6" rx="2" fill="#15803d" />
            </svg>
          </div>
          <div>
            <p className="lm-brand">LINDAMWANANCHI PLATFORM</p>
            <h1>LINDAMWANANCHI SAFETY NAVIGATION SYSTEM</h1>
            <p className="lm-meta">Citizen safety, live navigation, incident reporting, and administrative monitoring in one secure system.</p>
          </div>
        </div>

        <div className="lm-auth-card">
          <article>
            <h2>Sign In</h2>
            <p className="lm-meta">Step 1: Type your email or username and your password. Step 2: choose where you want to enter.</p>
            <form
              className="lm-auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                void onLogin(false);
              }}
            >
              <input placeholder="Email or Username" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
              <input placeholder="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <div className="lm-auth-action-row">
                <button type="submit">
                  {busy === "login" ? "Signing In..." : "Enter User Dashboard"}
                </button>
                <button type="button" className="lm-secondary-button" onClick={() => void onLogin(true)}>
                  {busy === "admin" ? "Opening Admin..." : "Enter Admin Dashboard"}
                </button>
              </div>
              <small>{loginStatus || "Use Admin Dashboard only if your account role is admin."}</small>
            </form>
          </article>

          <article className="lm-admin-login-card">
            <h2>Admin Access</h2>
            <p className="lm-meta">Administrators do not need a separate account type here. Enter admin credentials above, then click <strong>Enter Admin Dashboard</strong>.</p>
            <button type="button" onClick={() => void onLogin(true)}>
              {busy === "admin" ? "Opening Admin..." : "Open Admin Dashboard"}
            </button>
            <small>Admin login uses the same form on the left. If you are not an admin, the system will stop you safely.</small>
          </article>
        </div>

        <section className="lm-auth-register">
          <h2>Create User Account</h2>
          <p className="lm-meta">This is the quickest way to start if you do not already have an account. Only these three fields are required.</p>
          <form
            className="lm-auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              void onRegister();
            }}
          >
            <div className="lm-auth-register-grid">
              <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
              <input placeholder="Password (minimum 8 characters)" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
            </div>
            <button type="submit">
              {busy === "register" ? "Creating Account..." : "Create Account and Continue"}
            </button>
            <small>{registerStatus || "After account creation, you will be signed in automatically."}</small>
          </form>
        </section>
      </section>
    </main>
  );
}
