import { useEffect, useState } from "react";
import { authApi } from "./services/api";

const initialForm = { username: "", email: "", password: "" };

function Logo() {
    return <div className="logo"><span className="logo-mark">✦</span><span>lelé</span></div>;
}

function Field({ label, type = "text", value, onChange, placeholder, autoComplete }) {
    return <label className="field"><span>{label}</span><input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required /></label>;
}

function Shell({ children, onNavigate }) {
    return <main className="site-shell"><nav><button className="brand-button" onClick={() => onNavigate("landing")}><Logo /></button><div className="nav-note"><span className="status-dot" /> Secure access, simply made</div></nav>{children}<footer><span>lelé / account security</span><span>Protected by JWT sessions</span></footer></main>;
}

function Landing({ onNavigate }) {
    return <section className="landing page-enter"><div className="hero-copy"><p className="eyebrow">A calmer way in</p><h1>Your account,<br /><em>kept yours.</em></h1><p className="hero-text">A private space for your reading life. Sign in securely, keep every device in view, and stay in control.</p><div className="hero-actions"><button className="button button-dark" onClick={() => onNavigate("register")}>Create your account <span>↗</span></button><button className="text-button" onClick={() => onNavigate("login")}>I already have an account <span>→</span></button></div></div><div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-card"><span className="card-kicker">MEMBER SPACE</span><strong>Keep it<br /><i>personal.</i></strong><div className="art-footer"><span>● ● ●</span><span>2026</span></div></div><p className="art-caption">Designed around you<br />and your privacy.</p></div></section>;
}

function AuthLayout({ title, subtitle, children, onBack }) {
    return <section className="auth-layout page-enter"><div className="auth-aside"><p className="eyebrow">Welcome to lelé</p><h1>Small steps.<br /><em>Good habits.</em></h1><p>One secure sign-in for the things that matter to you.</p><button className="back-link" onClick={onBack}>← Back to home</button></div><div className="auth-panel"><div className="panel-heading"><p className="eyebrow">Account access</p><h2>{title}</h2><p>{subtitle}</p></div>{children}</div></section>;
}

function Notice({ error, success }) { return (error || success) ? <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || success}</div> : null; }

function Register({ onNavigate, onRegistered }) {
    const [form, setForm] = useState(initialForm); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
    const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
    async function submit(event) { event.preventDefault(); setError(""); setBusy(true); try { await authApi.register(form); onRegistered(form.email, form.username); } catch (err) { setError(err.message); } finally { setBusy(false); } }
    return <AuthLayout title="Create your account" subtitle="Start with the basics. We’ll send a one-time code to confirm your email." onBack={() => onNavigate("landing")}><form onSubmit={submit}><Field label="Username" value={form.username} onChange={update("username")} placeholder="your name" autoComplete="username" /><Field label="Email address" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" /><Field label="Password" type="password" value={form.password} onChange={update("password")} placeholder="At least 8 characters" autoComplete="new-password" /><Notice error={error} /><button className="button button-dark button-full" disabled={busy}>{busy ? "Creating account..." : "Continue to verification  →"}</button></form><p className="switch-copy">Already registered? <button onClick={() => onNavigate("login")}>Sign in</button></p></AuthLayout>;
}

function Verify({ email, username, onNavigate, onVerified }) {
    const [otp, setOtp] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
    async function submit(event) { event.preventDefault(); setError(""); setBusy(true); try { const data = await authApi.verifyEmail({ email, otp }); localStorage.setItem("accessToken", data.accesstoken); onVerified(data.user); } catch (err) { setError(err.message); } finally { setBusy(false); } }
    return <AuthLayout title="Check your inbox" subtitle={<>We sent a six-digit code to <strong>{email}</strong>.</>} onBack={() => onNavigate("register")}><form onSubmit={submit}><div className="otp-intro"><span className="mail-icon">@</span><div><strong>Almost there, {username || "friend"}.</strong><p>Enter the code to activate your account.</p></div></div><label className="field"><span>Verification code</span><input className="otp-input" inputMode="numeric" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" autoFocus required /></label><Notice error={error} /><button className="button button-dark button-full" disabled={busy || otp.length !== 6}>{busy ? "Verifying..." : "Verify email  →"}</button></form><p className="help-copy">Didn’t receive it? Check spam, or <button onClick={() => onNavigate("register")}>try again</button>.</p></AuthLayout>;
}

function Login({ onNavigate, onLoggedIn }) {
    const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
    async function submit(event) { event.preventDefault(); setError(""); setBusy(true); try { const data = await authApi.login({ email, password }); localStorage.setItem("accessToken", data.accesstoken); onLoggedIn(data.user); } catch (err) { setError(err.message); } finally { setBusy(false); } }
    return <AuthLayout title="Good to see you" subtitle="Sign in to continue to your private space." onBack={() => onNavigate("landing")}><form onSubmit={submit}><Field label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /><Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" /><div className="form-row"><span className="muted">Your session is encrypted</span><span className="lock">◆</span></div><Notice error={error} /><button className="button button-dark button-full" disabled={busy}>{busy ? "Signing in..." : "Sign in  →"}</button></form><p className="switch-copy">New here? <button onClick={() => onNavigate("register")}>Create an account</button></p></AuthLayout>;
}

function Dashboard({ user, onLogout, onLogoutAll }) {
    const [message, setMessage] = useState(""); const initials = (user?.username || "U").slice(0, 2).toUpperCase();
    async function action(fn, text) { try { await fn(); setMessage(text); if (text.includes("all")) onLogout(); } catch (err) { setMessage(err.message); } }
    return <section className="dashboard page-enter"><header className="dash-head"><div><p className="eyebrow">Private space / overview</p><h1>Good morning, {user?.username || "friend"}.</h1></div><button className="avatar" onClick={onLogout} title="Sign out">{initials}</button></header><div className="welcome-strip"><div><span className="strip-label">ACCOUNT STATUS</span><h2>You’re all set.</h2><p>Your email is verified and your account is protected.</p></div><span className="verified-badge">✓ Verified</span></div><div className="dash-grid"><article className="info-card"><div className="card-top"><span className="icon-tile">◎</span><span className="card-label">PROFILE</span></div><h3>{user?.email}</h3><p>Member account</p><div className="line-item"><span>Username</span><strong>{user?.username}</strong></div><div className="line-item"><span>Email</span><strong>Verified</strong></div></article><article className="info-card session-card"><div className="card-top"><span className="icon-tile">◌</span><span className="card-label">SECURITY</span></div><h3>Session controls</h3><p>Manage where you’re signed in.</p><button className="outline-button" onClick={() => action(onLogoutAll, "Logged out from all sessions.")}>Sign out everywhere <span>↗</span></button><button className="quiet-button" onClick={() => action(onLogout, "Signed out.")}>Sign out of this device</button></article></div>{message && <div className="notice notice-success dash-notice">{message}</div>}<div className="privacy-note"><span>✦</span><p><strong>Your privacy is the point.</strong><br />Refresh tokens are held securely in an HTTP-only cookie, so your session stays yours.</p></div></section>;
}

export default function App() {
    const [view, setView] = useState("landing"); const [user, setUser] = useState(null); const [pending, setPending] = useState({ email: "", username: "" });
    useEffect(() => { const token = localStorage.getItem("accessToken"); if (token) authApi.getMe(token).then((data) => { setUser(data.user); setView("dashboard"); }).catch(() => localStorage.removeItem("accessToken")); }, []);
    function logout() { localStorage.removeItem("accessToken"); setUser(null); setView("landing"); }
    let content = view === "register" ? <Register onNavigate={setView} onRegistered={(email, username) => { setPending({ email, username }); setView("verify"); }} /> : view === "verify" ? <Verify {...pending} onNavigate={setView} onVerified={(nextUser) => { setUser(nextUser); setView("dashboard"); }} /> : view === "login" ? <Login onNavigate={setView} onLoggedIn={(nextUser) => { setUser(nextUser); setView("dashboard"); }} /> : view === "dashboard" ? <Dashboard user={user} onLogout={logout} onLogoutAll={() => authApi.logoutAll().then(logout)} /> : <Landing onNavigate={setView} />;
    return <Shell onNavigate={setView}>{content}</Shell>;
}