import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "basura_admin_session";
const sessionDuration = 60 * 60 * 8;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(username: string) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDuration,
  });
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return (
      payload.role === "admin" &&
      payload.sub === process.env.ADMIN_USERNAME
    );
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
  }
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(cookieName);
}
