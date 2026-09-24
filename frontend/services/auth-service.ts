import apiClient from '@/lib/api-client';
import { ApiResponse, User } from '@/types/api';
import Cookies from 'js-cookie';
import { auditLogService } from '@/services/audit-log-service';
import { userService } from '@/services/user-service';

export interface LoginPayload {
  email?: string;
  username?: string;
  password?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const cleanEmail = (payload.email || "").trim().toLowerCase();
    const cleanPassword = (payload.password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error("Gagal Masuk: Email dan password wajib diisi!");
    }

    try {
      // 1. Pre-check status from local storage
      if (typeof window !== "undefined") {
        const savedStatus = localStorage.getItem(`simkap_user_status_${cleanEmail}`);
        if (savedStatus === "INACTIVE") {
          throw new Error("Akun Anda telah dinonaktifkan oleh Administrator. Akses login ditolak.");
        }
      }

      // 2. Try real backend API
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
      const { token, user } = response.data.data;
      
      let isInactive = user.status === "INACTIVE";
      if (typeof window !== "undefined") {
        const savedStatus = localStorage.getItem(`simkap_user_status_${cleanEmail}`);
        if (savedStatus === "INACTIVE") {
          isInactive = true;
        }
      }
      if (isInactive) {
        throw new Error("Akun Anda telah dinonaktifkan oleh Administrator. Akses login ditolak.");
      }

      Cookies.set('simkap_token', token, { expires: 7, secure: process.env.NODE_ENV === 'production', path: '/' });
      Cookies.set('simkap_user', JSON.stringify(user), { expires: 7, path: '/' });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("access_token", token);
        localStorage.setItem("simkap_token", token);
        localStorage.setItem("simkap_user", JSON.stringify(user));
      }
      
      return { token, user };
    } catch (err: any) {
      // If error is account inactive, rethrow
      if (err.message && err.message.includes("Akun Anda telah dinonaktifkan")) {
        throw err;
      }
      if (err.response?.status === 403) {
        throw new Error(err.response?.data?.message || "Akun Anda telah dinonaktifkan oleh Administrator. Akses login ditolak.");
      }

      // If real backend responded with 401 or 422 (unauthorized / wrong credentials), throw exact error
      if (err.response && (err.response.status === 401 || err.response.status === 422)) {
        throw new Error("Gagal Masuk: Email atau password yang Anda masukkan salah (401 Unauthorized). Silakan periksa kembali.");
      }

      // === LOCAL / FALLBACK AUTHENTICATION WITH STRICT VALIDATION ===
      
      // Step A: Check if the user exists in known user database
      let allRegisteredUsers: User[] = [];
      try {
        allRegisteredUsers = await userService.getAll();
      } catch {
        allRegisteredUsers = [];
      }

      // Normalize email alias mappings
      let lookupEmail = cleanEmail;
      if (cleanEmail === "manager1@gmail.com") {
        lookupEmail = "manager@gmail.com";
      } else if (cleanEmail === "employee@gmail.com") {
        lookupEmail = "sarah@gmail.com";
      }

      const matchedUser = allRegisteredUsers.find(
        (u) => u.email.toLowerCase().trim() === lookupEmail || u.email.toLowerCase().trim() === cleanEmail
      );

      // If user is not found in registered database, REJECT WITH ERROR
      if (!matchedUser) {
        throw new Error(`Gagal Masuk: Email '${payload.email}' tidak terdaftar di sistem. Silakan periksa kembali email Anda.`);
      }

      // Step B: Check account status
      let userStatus: "ACTIVE" | "INACTIVE" = (matchedUser.status as "ACTIVE" | "INACTIVE") || "ACTIVE";
      if (typeof window !== "undefined") {
        const savedStatus =
          localStorage.getItem(`simkap_user_status_${cleanEmail}`) ||
          localStorage.getItem(`simkap_user_status_${lookupEmail}`);
        if (savedStatus) userStatus = savedStatus as "ACTIVE" | "INACTIVE";
      }
      if (userStatus === "INACTIVE") {
        throw new Error("Akun Anda telah dinonaktifkan oleh Administrator. Akses login ditolak.");
      }

      // Step C: Check password
      let expectedPassword = "password";
      if (typeof window !== "undefined") {
        const customPass =
          localStorage.getItem(`simkap_custom_password_${cleanEmail}`) ||
          localStorage.getItem(`simkap_custom_password_${lookupEmail}`);
        if (customPass) {
          expectedPassword = customPass;
        }
      }

      if (cleanPassword !== expectedPassword) {
        throw new Error("Gagal Masuk: Password yang Anda masukkan salah. Silakan periksa kembali.");
      }

      // Step D: Successfully authenticate user
      const userRole = (matchedUser.role || matchedUser.roles?.[0] || "EMPLOYEE").toUpperCase();
      let userPerms = matchedUser.permissions;
      if (typeof window !== "undefined") {
        try {
          const rawPerms =
            localStorage.getItem(`simkap_user_perm_${cleanEmail}`) ||
            localStorage.getItem(`simkap_user_perm_${lookupEmail}`);
          if (rawPerms) userPerms = JSON.parse(rawPerms);
        } catch {
          // ignore
        }
      }

      const finalUser: User = {
        ...matchedUser,
        role: userRole,
        roles: [userRole],
        permissions:
          userPerms && userPerms.length > 0
            ? userPerms
            : userRole === "ADMIN"
            ? ["*"]
            : userRole === "MANAGER"
            ? ["tasks.create", "tasks.submit", "tasks.review", "evaluations.create"]
            : ["tasks.submit"],
      };

      const mockToken = `demo_token_${userRole}_${Date.now()}`;
      Cookies.set('simkap_token', mockToken, { expires: 7, path: '/' });
      Cookies.set('simkap_user', JSON.stringify(finalUser), { expires: 7, path: '/' });
      if (typeof window !== "undefined") {
        localStorage.setItem('simkap_user', JSON.stringify(finalUser));
      }

      auditLogService.logActivity(
        finalUser.name,
        "USER_LOGIN",
        "App\\Models\\User",
        `Pengguna '${finalUser.name}' (${finalUser.role}) berhasil masuk ke sistem`
      );

      return { token: mockToken, user: finalUser };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore if session is already expired
    } finally {
      Cookies.remove('simkap_token', { path: '/' });
      Cookies.remove('simkap_user', { path: '/' });
      if (typeof window !== "undefined") {
        localStorage.removeItem('simkap_user');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('simkap_token');
      }
      window.location.href = '/login';
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      const user = response.data.data;
      if (user) {
        Cookies.set('simkap_user', JSON.stringify(user), { expires: 7 });
        return user;
      }
    } catch {
      // ignore
    }
    return authService.getCurrentUser();
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("simkap_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const cleanEmail = parsed.email?.toLowerCase().trim();
          const savedPerms = cleanEmail ? localStorage.getItem(`simkap_user_perm_${cleanEmail}`) : null;
          const savedRole = cleanEmail ? localStorage.getItem(`simkap_user_role_${cleanEmail}`) : null;

          // FIX: Handle empty strings and undefined properly
          let currentRole: string;
          if (savedRole && savedRole.trim() !== "") {
            currentRole = savedRole;
          } else if (parsed.role && parsed.role.trim() !== "") {
            currentRole = parsed.role;
          } else if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 && parsed.roles[0].trim() !== "") {
            currentRole = parsed.roles[0];
          } else {
            currentRole = "EMPLOYEE"; // Default fallback
          }

          let permissions = parsed.permissions || ["tasks.submit"];
          if (savedPerms) {
            try {
              permissions = JSON.parse(savedPerms);
            } catch {
              // ignore
            }
          }

          return {
            ...parsed,
            role: currentRole,
            roles: [currentRole],
            permissions,
          };
        } catch {
          // ignore
        }
      }
    }
    const userCookie = Cookies.get('simkap_user');
    if (!userCookie) return null;
    try {
      const parsed = JSON.parse(userCookie);
      const cleanEmail = parsed.email?.toLowerCase().trim();
      const savedPerms = cleanEmail ? localStorage.getItem(`simkap_user_perm_${cleanEmail}`) : null;
      const savedRole = cleanEmail ? localStorage.getItem(`simkap_user_role_${cleanEmail}`) : null;

      // FIX: Handle empty strings and undefined properly
      let currentRole: string;
      if (savedRole && savedRole.trim() !== "") {
        currentRole = savedRole;
      } else if (parsed.role && parsed.role.trim() !== "") {
        currentRole = parsed.role;
      } else if (parsed.roles && Array.isArray(parsed.roles) && parsed.roles.length > 0 && parsed.roles[0].trim() !== "") {
        currentRole = parsed.roles[0];
      } else {
        currentRole = "EMPLOYEE"; // Default fallback
      }

      let permissions = parsed.permissions || ["tasks.submit"];
      if (savedPerms) {
        try {
          permissions = JSON.parse(savedPerms);
        } catch {
          // ignore
        }
      }

      return {
        ...parsed,
        role: currentRole,
        roles: [currentRole],
        permissions,
      };
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('simkap_token');
  },
};
