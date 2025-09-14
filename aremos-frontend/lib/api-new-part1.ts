"use client";

import { ApiResponse } from "./api-types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "aremos_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  // Token nur aus Cookie lesen (nicht localStorage)
  const match = document.cookie.match(new RegExp((^| ) + TOKEN_KEY + =([^;]+)));
  return match ? match[2] : null;
}

export function setToken(jwt: string) {
  if (typeof window === "undefined") return;
  // NUR Cookie setzen (kein localStorage)
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  document.cookie = ${TOKEN_KEY}=; path=/; SameSite=Strict; Max-Age=;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  // Cookie löschen (kein localStorage)
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  document.cookie = ${TOKEN_KEY}=; path=/; SameSite=Strict; Max-Age=0;
}
