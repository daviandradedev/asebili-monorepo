"use client";

import { useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { SESSION_REFRESH_KEY, shouldRefreshSession } from "../lib/session-refresh";

export function SessionKeepAlive() {
  useEffect(() => {
    if (!shouldRefreshSession(localStorage.getItem(SESSION_REFRESH_KEY))) return;
    void authClient.getSession().then(({ data }) => {
      if (data) localStorage.setItem(SESSION_REFRESH_KEY, String(Date.now()));
    });
  }, []);

  return null;
}
