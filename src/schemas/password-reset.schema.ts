import z from "zod";

const basePasswordSchema = z.object({
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

export const passwordResetSchema = basePasswordSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
    when(payload) {
      return basePasswordSchema
        .pick({ password: true, confirmPassword: true })
        .safeParse(payload.value).success;
    },
  },
);
