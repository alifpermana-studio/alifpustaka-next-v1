import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BASE_URL || process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://alifpustaka.local:3000",
    "http://app.alifpustaka.local:3001",
    "https://alifpustaka.web.id",
    "https://app.alifpustaka.web.id",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    cookiePrefix: "shared_auth",
    crossSubDomainCookies: {
      enabled: !!process.env.COOKIE_DOMAIN,
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
    defaultCookieAttributes: {
      domain: process.env.COOKIE_DOMAIN || undefined, // Use the environment variable or undefined if not set
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});
