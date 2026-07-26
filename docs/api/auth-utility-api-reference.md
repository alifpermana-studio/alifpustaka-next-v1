# Authentication Utility API Reference

API reference for authentication utility endpoints.

**Last Updated:** 2026-07-25

---

## Table of Contents

1. [Overview](#overview)
2. [Check Credential User](#check-credential-user)
3. [Error Codes](#error-codes)
4. [Examples](#examples)

---

## Overview

The Authentication Utility API provides helper endpoints for authentication-related operations.

**Features:**
- Check if user has credential-based account (email/password)
- Determine password reset eligibility
- Distinguish OAuth-only accounts from credential accounts

---

## Check Credential User

Check if a user has a credential-based account (email/password) or only OAuth accounts.

### Endpoint

```
POST /api/check-credential-user
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |

### Authentication

**Required:** None (public endpoint)

### Business Logic

- Queries user by email
- Checks if user has an account with `providerId: "credential"`
- Used to determine if password reset is available

**Use Cases:**
- Password reset flow: Check if user can reset password
- Login page: Show appropriate login options
- Account linking: Determine if credential account exists

### Success Response

**Status:** 200 OK

**User has credential account:**
```json
{
  "hasCredentialAccount": true,
  "message": "User has credential account"
}
```

**User has only OAuth accounts:**
```json
{
  "hasCredentialAccount": false,
  "message": "User only has OAuth accounts. Password reset not available."
}
```

**User not found:**
```json
{
  "hasCredentialAccount": false,
  "message": "User not found"
}
```

### Error Responses

**400 Bad Request** - Missing email
```json
{
  "error": "Email is required"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

### Example

```typescript
// Check if user can reset password
const response = await fetch('/api/check-credential-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const result = await response.json();

if (result.hasCredentialAccount) {
  console.log('User can reset password');
  // Show password reset form
} else {
  console.log('User cannot reset password');
  console.log('Reason:', result.message);
  // Show OAuth login options or "User not found" message
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `Email is required` | 400 | Email parameter not provided |
| `Internal server error` | 500 | Server error occurred |

---

## Examples

### Password Reset Flow

```typescript
async function initiatePasswordReset(email: string) {
  // Step 1: Check if user has credential account
  const checkResponse = await fetch('/api/check-credential-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const checkResult = await checkResponse.json();

  if (!checkResult.hasCredentialAccount) {
    if (checkResult.message === 'User not found') {
      return {
        success: false,
        message: 'No account found with this email address.'
      };
    } else {
      return {
        success: false,
        message: 'This account uses social login (Google/GitHub). Password reset is not available. Please sign in with your social account.'
      };
    }
  }

  // Step 2: Send password reset email
  // ... password reset logic here ...

  return {
    success: true,
    message: 'Password reset email sent. Please check your inbox.'
  };
}
```

### Forgot Password Component

```typescript
import { useState } from 'react';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Check if user has credential account
      const response = await fetch('/api/check-credential-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!result.hasCredentialAccount) {
        if (result.message === 'User not found') {
          setMessage('No account found with this email address.');
        } else {
          setMessage(
            'This account uses social login (Google/GitHub). ' +
            'Password reset is not available. Please sign in with your social account.'
          );
        }
        setIsLoading(false);
        return;
      }

      // Proceed with password reset
      // ... send reset email logic ...
      
      setMessage('Password reset link sent! Check your email.');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form">
      <h2>Forgot Password</h2>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      {message && (
        <div className={`message ${message.includes('sent') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Reset Password'}
      </button>

      <div className="links">
        <a href="/signin">Back to Sign In</a>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
```

### Login Page with Smart Redirects

```typescript
function LoginPage() {
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOAuthOnly, setShowOAuthOnly] = useState(false);

  async function handleEmailBlur() {
    if (!email) return;

    // Check account type
    const response = await fetch('/api/check-credential-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (result.hasCredentialAccount) {
      setShowPassword(true);
      setShowOAuthOnly(false);
    } else if (result.message === 'User only has OAuth accounts. Password reset not available.') {
      setShowPassword(false);
      setShowOAuthOnly(true);
    } else {
      // User not found - show both options
      setShowPassword(true);
      setShowOAuthOnly(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Sign In</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleEmailBlur}
        placeholder="Email address"
      />

      {showPassword && (
        <div className="password-section">
          <input type="password" placeholder="Password" />
          <button type="submit">Sign In</button>
          <a href="/forgot-password">Forgot password?</a>
        </div>
      )}

      {showOAuthOnly && (
        <div className="oauth-only-message">
          <p>This account uses social login. Please sign in with:</p>
        </div>
      )}

      <div className="oauth-buttons">
        <button className="oauth-google">Sign in with Google</button>
        <button className="oauth-github">Sign in with GitHub</button>
      </div>

      <p className="signup-link">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
```

### Auth Helper Service

```typescript
class AuthHelperService {
  static async checkCredentialAccount(email: string): Promise<{
    hasCredentialAccount: boolean;
    message: string;
  }> {
    const response = await fetch('/api/check-credential-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Failed to check credential account');
    }

    return await response.json();
  }

  static async canResetPassword(email: string): Promise<boolean> {
    const result = await this.checkCredentialAccount(email);
    return result.hasCredentialAccount;
  }

  static async getLoginMethod(email: string): Promise<'credential' | 'oauth' | 'not_found'> {
    const result = await this.checkCredentialAccount(email);
    
    if (result.message === 'User not found') {
      return 'not_found';
    } else if (result.hasCredentialAccount) {
      return 'credential';
    } else {
      return 'oauth';
    }
  }

  static getLoginHint(loginMethod: 'credential' | 'oauth' | 'not_found'): string {
    switch (loginMethod) {
      case 'credential':
        return 'Enter your password to continue';
      case 'oauth':
        return 'Please sign in using Google or GitHub';
      case 'not_found':
        return 'No account found. Sign up to create an account.';
    }
  }
}

export default AuthHelperService;
```

### Account Type Checker Hook

```typescript
import { useState, useEffect } from 'react';

function useAccountType(email: string) {
  const [accountType, setAccountType] = useState<'credential' | 'oauth' | 'not_found' | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setAccountType(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      
      try {
        const response = await fetch('/api/check-credential-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.message === 'User not found') {
          setAccountType('not_found');
        } else if (result.hasCredentialAccount) {
          setAccountType('credential');
        } else {
          setAccountType('oauth');
        }
      } catch (error) {
        console.error('Failed to check account type:', error);
        setAccountType(null);
      } finally {
        setIsChecking(false);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [email]);

  return { accountType, isChecking };
}

// Usage
function SmartLoginForm() {
  const [email, setEmail] = useState('');
  const { accountType, isChecking } = useAccountType(email);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      {isChecking && <p>Checking account...</p>}

      {accountType === 'credential' && (
        <input type="password" placeholder="Password" />
      )}

      {accountType === 'oauth' && (
        <p>Please use Google or GitHub to sign in</p>
      )}

      {accountType === 'not_found' && (
        <p>No account found. <a href="/signup">Sign up</a></p>
      )}
    </div>
  );
}
```

---

## Related Documentation

- [OAuth Setup](../auth/oauth-setup.md) - OAuth authentication setup
- [OAuth Implementation](../auth/oauth-implementation.md) - Technical OAuth details
- [RBAC System](../features/rbac.md) - User roles and permissions

---

## Account Type Reference

| Account Type | Description | Can Reset Password | Login Methods |
|--------------|-------------|-------------------|---------------|
| **Credential** | Email/password account | ✅ Yes | Email/password, OAuth (if linked) |
| **OAuth Only** | Google/GitHub only | ❌ No | OAuth only |
| **Not Found** | No account exists | N/A | Must sign up first |

---

**Last Updated:** 2026-07-25  
**API Version:** 1.0
