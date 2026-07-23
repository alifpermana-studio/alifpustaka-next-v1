import { Pool } from "pg";

/**
 * Generates a unique username for OAuth users
 * Strategy:
 * - For GitHub: Use provider username directly
 * - For Google: Extract from email (before @)
 * - If collision exists: append random 3-digit number
 */
export async function generateUsername(params: {
  email: string;
  provider: string;
  providerUsername?: string | null;
}): Promise<string> {
  const { email, provider, providerUsername } = params;

  // Get base username
  let baseUsername = "";

  if (provider === "github" && providerUsername) {
    // Use GitHub username directly
    baseUsername = providerUsername;
  } else {
    // Extract from email (before @)
    const emailPrefix = email.split("@")[0];
    baseUsername = emailPrefix;
  }

  // Sanitize username
  // - Convert to lowercase
  // - Remove special characters (keep alphanumeric and underscore)
  // - Limit to 20 characters
  let sanitized = baseUsername
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .substring(0, 20);

  // Ensure it's not empty
  if (!sanitized) {
    sanitized = "user";
  }

  // Check uniqueness in database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if username exists
    const result = await pool.query(
      'SELECT username FROM "user" WHERE username = $1',
      [sanitized]
    );

    if (result.rows.length === 0) {
      // Username is unique, return it
      return sanitized;
    }

    // Username exists, generate with random suffix
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit number
      const uniqueUsername = `${sanitized}${randomSuffix}`;

      const checkResult = await pool.query(
        'SELECT username FROM "user" WHERE username = $1',
        [uniqueUsername]
      );

      if (checkResult.rows.length === 0) {
        return uniqueUsername;
      }

      attempts++;
    }

    // Fallback: use timestamp
    return `${sanitized}${Date.now().toString().slice(-6)}`;
  } finally {
    await pool.end();
  }
}
