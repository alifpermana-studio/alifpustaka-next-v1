import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email";
import { after } from "next/server";
import { verificationHtml } from "./mail-templates/email-verification";
import { resetPasswordHtml } from "./mail-templates/reset-password";
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

  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      after(async () => {
        try {
          await sendEmail({
            to: user.email,
            subject: "Confirm your email registration",
            htmlContent: verificationHtml({
              url,
              host: process.env.BASE_URL || "http://alifpustaka.web.id",
              appName: "Alif Pustaka",
              name: user.name,
            }),
          });
        } catch (err) {
          // Always catch errors since this runs disconnected from the client
          console.error("Background verification email failed:", err);
        }
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 1800,
    sendResetPassword: async ({ user, url, token }) => {
      after(async () => {
        try {
          const baseUrl = process.env.BASE_URL || "http://localhost:3000";
          const resetUrl = `${baseUrl}/reset-password?token=${token}`;

          await sendEmail({
            to: user.email,
            subject: "Reset your password",
            htmlContent: resetPasswordHtml({
              url: resetUrl,
              host: baseUrl,
              appName: "Alif Pustaka",
              name: user.name,
            }),
          });
        } catch (err) {
          console.error("Background reset password failed:", err);
        }
      });
    },
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
