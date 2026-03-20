import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f8425d9e/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/make-server-f8425d9e/admin/reset-password", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return c.json({ error: "Missing authorization token." }, 401);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: authUserData, error: authUserError } = await adminClient.auth.getUser(token);
    if (authUserError || !authUserData.user) {
      return c.json({ error: "Unauthorized request." }, 401);
    }

    const { data: callerProfile, error: callerError } = await adminClient
      .from("profiles")
      .select("id, account_type, is_active")
      .eq("id", authUserData.user.id)
      .single();

    if (callerError || !callerProfile || callerProfile.account_type !== "super_admin" || callerProfile.is_active === false) {
      return c.json({ error: "Super Admin access is required." }, 403);
    }

    const body = await c.req.json();
    const userId = String(body.userId ?? "").trim();
    const newPassword = String(body.newPassword ?? "");

    if (!userId || !newPassword) {
      return c.json({ error: "User ID and new password are required." }, 400);
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return c.json({ error: "Password must be at least 8 characters and include uppercase, lowercase, and a number." }, 400);
    }

    const { error: resetError } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (resetError) {
      return c.json({ error: resetError.message }, 400);
    }

    const { error: profileUpdateError } = await adminClient
      .from("profiles")
      .update({
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", userId);

    if (profileUpdateError) {
      return c.json({ error: profileUpdateError.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return c.json({ error: message }, 500);
  }
});

Deno.serve(app.fetch);
