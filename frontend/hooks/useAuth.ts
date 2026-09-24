"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authService } from "@/services/auth-service";
import { User } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("useAuth - Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run once on mount
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      fetchUser();
    }

    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = () => {
      fetchUser();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchUser]);

  const hasRole = useCallback((roleName: string) => {
    return (
      user?.roles?.includes(roleName) ||
      user?.role === roleName ||
      false
    );
  }, [user]);

  const hasPermission = useCallback((permissionName: string) => {
    return user?.permissions?.includes(permissionName) || false;
  }, [user]);

  const isManagerOrAdmin = useCallback(() => {
    return hasRole("ADMIN") || hasRole("MANAGER");
  }, [hasRole]);

  const updateUser = useCallback((newUserData: User) => {
    setUser(newUserData);
    // Dispatch event for other components to refresh
    window.dispatchEvent(new Event("simkap_user_updated"));
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    isManagerOrAdmin,
    refreshUser: fetchUser,
    updateUser,
  };
}
