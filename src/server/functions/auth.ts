import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { createSession, createUser, deleteSession, getUserByEmail, userExists, validateSession, verifyPassword } from "../auth";

export const login = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    email: z.email(),
    password: z.string(),
  }))
  .handler(async ({ data }) => {
    const user = await getUserByEmail((env as any).DB, data.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const { token, expiresAt } = await createSession((env as any).DB);

    setCookie("session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expiresAt,
    });

    return { success: true };
  });

export const register = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }))
  .handler(async ({ data }) => {
    const hasUser = await userExists((env as any).DB);

    if (hasUser) {
      throw new Error("Registration is closed");
    }

    await createUser((env as any).DB, data.email, data.password);

    const { token, expiresAt } = await createSession((env as any).DB);

    setCookie("session_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: expiresAt,
    });

    return { success: true };
  });

export const checkUserExists = createServerFn()
  .handler(async () => {
    return { exists: await userExists((env as any).DB) };
  });

export const logout = createServerFn()
  .handler(async () => {
    const token = getCookie("session_token");
    if (token) {
      await deleteSession((env as any).DB, token);
      deleteCookie("session_token");
    }
    return { success: true };
  });

export const getSession = createServerFn()
  .handler(async () => {
    const token = getCookie("session_token");
    if (!token) return null;
    return await validateSession((env as any).DB, token);
  });
