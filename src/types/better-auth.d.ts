import "better-auth/types";

declare module "better-auth/types" {
  interface User {
    username?: string | null;
    role?: string;
    status?: string;
  }
}
