const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		...options,
		credentials: "include",
		headers: { "Content-Type": "application/json", ...options.headers },
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(payload.message || "Something went wrong");
	return payload;
}

export const authApi = {
	register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
	verifyEmail: (body) => request("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
	login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
	getMe: (token) => request("/auth/get-me", { headers: { Authorization: `Bearer ${token}` } }),
	refreshToken: () => request("/auth/refresh-token"),
	logout: () => request("/auth/logout"),
	logoutAll: () => request("/auth/logout-all"),
};
