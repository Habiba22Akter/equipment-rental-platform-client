export const ROLES = ["Customer", "Owner", "Admin"] as const;

export type Role = (typeof ROLES)[number];

/**
 * Normalises a role coming from a form, database record or OAuth profile.
 * Anything that is not a known role falls back to `Customer`.
 */
export function normalizeRole(value: unknown, fallback: Role = "Customer"): Role {
  if (typeof value !== "string") return fallback;

  const match = ROLES.find((role) => role.toLowerCase() === value.trim().toLowerCase());

  return match ?? fallback;
}

/**
 * Roles a person is allowed to pick while creating an account.
 * Admin accounts can only be promoted server-side by an existing admin.
 */
export function toSignupRole(value: unknown): Extract<Role, "Customer" | "Owner"> {
  return normalizeRole(value) === "Owner" ? "Owner" : "Customer";
}
