type AuthErrorLike = {
  code?: string;
  message?: string;
};

const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email or password is not correct. Please try again.",
  INVALID_EMAIL: "Enter a valid email address.",
  USER_ALREADY_EXISTS: "An account with this email already exists. Try signing in instead.",
  PASSWORD_TOO_SHORT: "Your password must be at least 6 characters long.",
  PASSWORD_TOO_LONG: "Your password is too long. Use 128 characters or fewer.",
  INVALID_PASSWORD: "Your password does not meet the requirements.",
  SESSION_EXPIRED: "Your session expired. Please sign in again.",
  PROVIDER_NOT_FOUND:
    "This sign-in provider is not configured yet. Add its client ID and secret to the environment.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
};

/**
 * Turns a Better Auth error into copy that is safe and useful to show in a toast.
 */
export function getAuthErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }

  return error.message?.trim() || "Something went wrong. Please try again.";
}
