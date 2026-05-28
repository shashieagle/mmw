import { useState, useEffect } from "react";

const STORAGE_KEY = "mmw_admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "mmw2025";

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem(STORAGE_KEY) === "true");
    setChecked(true);
  }, []);

  const unlock = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  };

  return { isAdmin, checked, unlock, lock };
}
