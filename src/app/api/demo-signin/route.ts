import { NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";

const demoRoles = ["Customer", "Owner", "Admin"] as const;
type DemoRole = (typeof demoRoles)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role as DemoRole;

    if (!demoRoles.includes(role)) {
      return NextResponse.json({ error: "Choose a valid demo role." }, { status: 400 });
    }

    const prefix = `DEMO_${role.toUpperCase()}`;
    const email = process.env[`${prefix}_EMAIL`]?.trim().toLowerCase();
    const password = process.env[`${prefix}_PASSWORD`];
    if (!email || !password) {
      return NextResponse.json({ error: `${role} demo sign-in is not configured on the server.` }, { status: 503 });
    }

    const origin = new URL(request.url).origin;
    const headers = new Headers({
      "Content-Type": "application/json",
      Origin: origin,
    });
    const authUrl = (path: string) => new URL(`/api/auth/${path}`, request.url);

    const signInResponse = await auth.handler(new Request(authUrl("sign-in/email"), {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password, rememberMe: true }),
    }));

    if (signInResponse.ok) {
      await db.collection("user").updateOne({ email }, { $set: { role } });
      return signInResponse;
    }

    const existingUser = await db.collection("user").findOne({ email }, { projection: { _id: 1 } });
    if (existingUser) return signInResponse;

    const signUpResponse = await auth.handler(new Request(authUrl("sign-up/email"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: `GearGrid Demo ${role}`,
        email,
        password,
        role: role === "Admin" ? "Customer" : role,
        rememberMe: true,
      }),
    }));

    if (!signUpResponse.ok) return signUpResponse;

    // Admin cannot be self-assigned in normal sign-up. Promote only this
    // server-configured demo account after Better Auth creates it.
    await db.collection("user").updateOne({ email }, { $set: { role } });
    return signUpResponse;
  } catch {
    return NextResponse.json({ error: "Could not start the demo sign-in. Check the server environment and database." }, { status: 500 });
  }
}
