import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email";
import { after } from "next/server";
import { verificationHtml } from "./mail-templates/email-verification";
import { resetPasswordHtml } from "./mail-templates/reset-password";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000", // Your local frontend port
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
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
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          await sendEmail({
            to: user.email,
            subject: "Reset your password",
            htmlContent: resetPasswordHtml({
              url,
              host: process.env.BASE_URL || "http://alifpustaka.web.id",
              appName: "Alif Pustaka",
              name: user.name,
            }),
          });
        } catch (err) {
          // Always catch errors since this runs disconnected from the client
          console.error("Background reset password failed:", err);
        }
      });
    },
  },
  plugins: [
    username({
      schema: {
        user: {
          fields: {
            displayUsername: "username",
          },
        },
      },
    }),
  ],
  // Explicitly define the schema mapping
});
