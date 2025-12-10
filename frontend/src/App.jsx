import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  // auth state
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // subscriptions state
  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState("");
  const [newSub, setNewSub] = useState({
    name: "",
    provider: "",
    amount: "",
    billing_cycle: "monthly",
  });
  const [subSaving, setSubSaving] = useState(false);

  // helpers
  async function login() {
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (data.access_token) {
        setToken(data.access_token);
        setActiveTab("Dashboard");
        setAuthSuccess("Logged in successfully.");
        await loadSubs(data.access_token);
      }
    } catch (err) {
      setAuthError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function register() {
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const body = {
        email,
        password,
        full_name: "UDLM User",
      };

      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setAuthSuccess("Account created. Logging you in…");
      await login(); // auto-login
    } catch (err) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadSubs(tok) {
    setSubsLoading(true);
    setSubsError("");
    try {
      const res = await fetch(`${API}/api/v1/subscriptions/`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to load subscriptions");
      }
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      setSubsError(err.message || "Failed to load subscriptions");
    } finally {
      setSubsLoading(false);
    }
  }

  async function createSubscription() {
    if (!newSub.name.trim()) {
      setSubsError("Name is required for a subscription.");
      return;
    }

    setSubsError("");
    setSubSaving(true);

    try {
      const body = {
        name: newSub.name,
        provider: newSub.provider || null,
        amount: newSub.amount ? parseFloat(newSub.amount) : null,
        currency: "INR",
        billing_cycle: newSub.billing_cycle,
        next_payment_date: null,
        auto_detected: false,
        is_active: true,
        notes: null,
      };

      const res = await fetch(`${API}/api/v1/subscriptions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create subscription");
      }

      // add to list
      setSubs((prev) => [...prev, data]);
      setNewSub({ name: "", provider: "", amount: "", billing_cycle: "monthly" });
      setSubsError("");
    } catch (err) {
      setSubsError(err.message || "Failed to create subscription");
    } finally {
      setSubSaving(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadSubs(token);
    }
  }, [token]);

  const totalMonthly = subs.reduce((sum, s) => {
    if (!s.amount) return sum;
    if (s.billing_cycle === "yearly") return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  function logout() {
    setToken("");
    setSubs([]);
    setActiveTab("Dashboard");
    setAuthSuccess("");
    setAuthError("");
  }

  return (
    <div className="app-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          UDLM<span>.</span>
        </div>

        <div className="nav-title">Overview</div>
        <ul className="nav-list">
          <NavItem
            label="Dashboard"
            active={activeTab === "Dashboard"}
            onClick={() => setActiveTab("Dashboard")}
          />
          <NavItem
            label="Subscriptions"
            active={activeTab === "Subscriptions"}
            onClick={() => setActiveTab("Subscriptions")}
          />
          <NavItem
            label="Documents"
            active={activeTab === "Documents"}
            onClick={() => setActiveTab("Documents")}
          />
          <NavItem
            label="Reminders"
            active={activeTab === "Reminders"}
            onClick={() => setActiveTab("Reminders")}
          />
          <NavItem
            label="Security"
            active={activeTab === "Security"}
            onClick={() => setActiveTab("Security")}
          />
        </ul>

        <div className="sidebar-footer">
          Universal Digital Life Manager
          <br />
          Professional Apple-like UI
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{activeTab}</div>
            <div className="topbar-subtitle">
              {activeTab === "Dashboard" &&
                "One place to see subscriptions, IDs, reminders & security."}
              {activeTab === "Subscriptions" &&
                "Manage and review all your recurring payments in one view."}
              {activeTab === "Documents" &&
                "Secure vault for Aadhaar, PAN, marksheets and more."}
              {activeTab === "Reminders" &&
                "Expiry alerts for rent, IDs, warranties and bills."}
              {activeTab === "Security" &&
                "Password health, breach checks and digital hygiene."}
            </div>
          </div>
          <div className="topbar-actions">
            {token && <button onClick={logout}>Logout</button>}
          </div>
        </div>

        {/* Auth box when logged out */}
        {!token && (
          <section className="auth-box">
            <div className="auth-title">Sign in to your UDLM space</div>
            <div className="auth-desc">
              Use any email/password for now (local dev). This connects the
              Apple-like frontend to your FastAPI backend.
            </div>

            <div className="input-row">
              <input
                className="input"
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authError && (
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 11,
                  color: "#fecaca",
                  background: "rgba(248, 113, 113, 0.15)",
                  borderRadius: 12,
                  padding: "6px 10px",
                  border: "1px solid rgba(248, 113, 113, 0.6)",
                }}
              >
                {authError}
              </div>
            )}

            {authSuccess && (
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 11,
                  color: "#bbf7d0",
                  background: "rgba(34, 197, 94, 0.1)",
                  borderRadius: 12,
                  padding: "6px 10px",
                  border: "1px solid rgba(34, 197, 94, 0.5)",
                }}
              >
                {authSuccess}
              </div>
            )}

            <div className="button-row">
              <button className="btn-primary" onClick={login} disabled={authLoading}>
                {authLoading ? "Please wait…" : "Login"}
              </button>
              <button className="btn-ghost" onClick={register} disabled={authLoading}>
                {authLoading ? "Please wait…" : "Register"}
              </button>
            </div>
          </section>
        )}

        {/* Tabs content (only when logged in) */}
        {token && activeTab === "Dashboard" && (
          <>
            <section className="grid grid-3">
              <div className="card">
                <div className="card-title">Active subscriptions</div>
                <div className="card-value">{subs.length}</div>
              </div>
              <div className="card">
                <div className="card-title">Estimated monthly spend</div>
                <div className="card-value">₹{totalMonthly.toFixed(0)}</div>
              </div>
              <div className="card card-muted">
                <div className="card-title">AI assistant</div>
                <div className="card-value">Coming soon</div>
              </div>
            </section>

            <section className="table-card">
              <h2>Your subscriptions</h2>
              <p>Overview of all active services.</p>
              <SubscriptionsTable subs={subs} subsLoading={subsLoading} />
            </section>
          </>
        )}

        {token && activeTab === "Subscriptions" && (
          <>
            {/* Summary card */}
            <section className="card">
              <div className="card-title">Subscriptions overview</div>
              <div className="card-value">
                {subs.length} active • approx ₹{totalMonthly.toFixed(0)} / month
              </div>
            </section>

            {/* Add subscription form */}
            <section className="auth-box" style={{ marginTop: 10 }}>
              <div className="auth-title">Add subscription</div>
              <div className="auth-desc">
                Minimal form to create a new record in your FastAPI backend.
              </div>

              <div className="input-row">
                <input
                  className="input"
                  placeholder="Name (e.g. Netflix)"
                  value={newSub.name}
                  onChange={(e) =>
                    setNewSub((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Provider (optional)"
                  value={newSub.provider}
                  onChange={(e) =>
                    setNewSub((s) => ({ ...s, provider: e.target.value }))
                  }
                />
              </div>

              <div className="input-row">
                <input
                  className="input"
                  placeholder="Amount (e.g. 499)"
                  value={newSub.amount}
                  onChange={(e) =>
                    setNewSub((s) => ({ ...s, amount: e.target.value }))
                  }
                />
                <select
                  className="input"
                  value={newSub.billing_cycle}
                  onChange={(e) =>
                    setNewSub((s) => ({ ...s, billing_cycle: e.target.value }))
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {subsError && (
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 11,
                    color: "#fecaca",
                    background: "rgba(248, 113, 113, 0.15)",
                    borderRadius: 12,
                    padding: "6px 10px",
                    border: "1px solid rgba(248, 113, 113, 0.6)",
                  }}
                >
                  {subsError}
                </div>
              )}

              <div className="button-row">
                <button
                  className="btn-primary"
                  onClick={createSubscription}
                  disabled={subSaving}
                >
                  {subSaving ? "Saving…" : "Save subscription"}
                </button>
              </div>
            </section>

            {/* Full table */}
            <section className="table-card">
              <h2>All subscriptions</h2>
              <p>Full list of recurring payments.</p>
              <SubscriptionsTable subs={subs} subsLoading={subsLoading} />
            </section>
          </>
        )}

        {token && activeTab === "Documents" && (
          <>
            <section className="card">
              <div className="card-title">Documents vault</div>
              <div className="card-value">Coming soon</div>
            </section>
            <section className="card card-muted">
              <div className="card-title">Planned features</div>
              <ul style={{ fontSize: 12, marginTop: 6, color: "#e5e7eb" }}>
                <li>• Auto-backup Aadhaar, PAN, marksheets from email</li>
                <li>• Expiry alerts for IDs, passports, visas</li>
                <li>• Encrypted local storage + cloud sync</li>
              </ul>
            </section>
          </>
        )}

        {token && activeTab === "Reminders" && (
          <>
            <section className="card">
              <div className="card-title">Expiry & bill reminders</div>
              <div className="card-value">Prototype stage</div>
            </section>
            <section className="card card-muted">
              <div className="card-title">Ideas</div>
              <ul style={{ fontSize: 12, marginTop: 6, color: "#e5e7eb" }}>
                <li>• Rent due, credit card bill, OTT renewal</li>
                <li>• Warranty expiry for electronics & bikes</li>
                <li>• Smart nudges: “pay all bills Friday 8pm”</li>
              </ul>
            </section>
          </>
        )}

        {token && activeTab === "Security" && (
          <>
            <section className="card">
              <div className="card-title">Password health (mock)</div>
              <div className="card-value">74 / 100</div>
            </section>
            <section className="card card-muted">
              <div className="card-title">Upcoming</div>
              <ul style={{ fontSize: 12, marginTop: 6, color: "#e5e7eb" }}>
                <li>• Weak & reused password detection</li>
                <li>• Breach check via HaveIBeenPwned</li>
                <li>• Recommendations to improve digital hygiene</li>
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* Small components */

function NavItem({ label, active, onClick }) {
  const cls = active ? "nav-link active" : "nav-link";
  return (
    <li className={cls} onClick={onClick}>
      {label}
    </li>
  );
}

function SubscriptionsTable({ subs, subsLoading }) {
  if (subsLoading) {
    return <p>Loading subscriptions…</p>;
  }

  if (!subs || subs.length === 0) {
    return <p>No subscriptions found yet.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Amount</th>
            <th>Cycle</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.provider || "-"}</td>
              <td>{s.amount || "-"}</td>
              <td>{s.billing_cycle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

