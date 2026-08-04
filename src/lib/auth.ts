import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";
import { generateUsername } from "./utils/generate-username";
import { APIError } from "better-auth/api";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000", // Your local frontend port
    "https://alifpustaka.web.id", // Production domain
  ],
  database: pool,

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false, // Required for all users
        input: true, // Allows the client to send it
      },
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "active",
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    cookiePrefix: "shared_auth",
    crossSubdomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN || ".alifpustaka.web.id",
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BASE_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.BASE_URL}/api/auth/callback/github`,
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Check if this is OAuth signup (no username provided or empty)
          if (!user.username || user.username === "") {
            // This is an OAuth signup - generate username
            try {
              // Check for duplicate email with different provider
              const existingUser = await pool.query(
                'SELECT id FROM "user" WHERE email = $1',
                [user.email],
              );

              if (existingUser.rows.length > 0) {
                throw new APIError("BAD_REQUEST", {
                  message: "Email already registered with different provider",
                });
              }

              // Generate unique username for OAuth user
              const generatedUsername = await generateUsername({
                email: user.email,
                provider: "oauth",
                providerUsername: null,
              });

              console.log(
                `[OAuth] Generating username for ${user.email}: ${generatedUsername}`,
              );

              // Return modified user data with generated username
              return {
                data: {
                  ...user,
                  username: generatedUsername,
                  emailVerified: true, // OAuth users have verified emails
                },
              };
            } catch (err) {
              console.error("[OAuth] Username generation error:", err);
              throw err;
            }
          }

          // Email/password signup - username already provided
          return { data: user };
        },
      },
    },
  },

  plugins: [],

  // Explicitly define the schema mapping
});
