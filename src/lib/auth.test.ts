import { describe, expect, it } from "vitest";

import { auth } from "@/lib/auth";

// Exercise Better Auth through its HTTP handler (the same entry point as
// /api/auth/$) against a migrated D1, so these cover the auth schema too.
const origin = "http://localhost:3000";

function post(path: string, body: Record<string, string>) {
  return auth.handler(
    new Request(`${origin}/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body),
    }),
  );
}

function sessionCookie(response: Response) {
  return response.headers.getSetCookie().find((cookie) => cookie.includes("session_token"));
}

describe("email and password auth", () => {
  const credentials = { email: "ada@example.com", password: "correct-horse-battery" };

  it("signs up, signs in, and returns the session", async () => {
    const signUp = await post("/sign-up/email", { ...credentials, name: "Ada" });
    expect(signUp.status).toBe(200);

    const signIn = await post("/sign-in/email", credentials);
    expect(signIn.status).toBe(200);
    const cookie = sessionCookie(signIn);
    expect(cookie).toBeDefined();

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookie?.split(";")[0] ?? "" }),
    });
    expect(session?.user.email).toBe(credentials.email);
  });

  it("rejects a wrong password", async () => {
    await post("/sign-up/email", {
      email: "grace@example.com",
      password: "right-password",
      name: "Grace",
    });

    const signIn = await post("/sign-in/email", {
      email: "grace@example.com",
      password: "wrong-password",
    });
    expect(signIn.status).toBe(401);
  });
});
