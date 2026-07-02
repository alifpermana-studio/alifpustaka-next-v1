import z from "zod";

const baseSignupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters long")
    .max(50, "Full name must be at most 50 characters long"),

  email: z.email("Invalid email"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Username only allowed to contain letters and numbers",
    ),

  password: z
    .string()
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password must be at most 30 characters long"),

  confirmPassword: z.string(),
});

export const signupSchema = baseSignupSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],

    // run if password & confirmPassword are valid
    when(payload) {
      return baseSignupSchema
        .pick({ password: true, confirmPassword: true })
        .safeParse(payload.value).success;
    },
  },
);
