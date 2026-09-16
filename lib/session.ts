import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_DURATION_SEC = 60 * 60 * 8;

export type StudentSession = {
  role: "student";
  studentId: number;
  classCode: string;
  studentNo: string;
  name: string;
};

export type AdminSession = {
  role: "admin";
};

export type Session = StudentSession | AdminSession;

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 8) {
    throw new Error(
      "SESSION_SECRET 환경변수가 없거나 너무 짧습니다(8자 이상). .env.local 또는 Vercel 설정에 넣어주세요.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SEC}s`)
    .sign(getKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SEC,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (payload.role === "admin") {
      return { role: "admin" };
    }
    if (payload.role === "student") {
      return {
        role: "student",
        studentId: payload.studentId as number,
        classCode: payload.classCode as string,
        studentNo: payload.studentNo as string,
        name: payload.name as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireStudent(): Promise<StudentSession> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    throw new SessionError("학생 로그인이 필요합니다.");
  }
  return session;
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new SessionError("관리자 로그인이 필요합니다.");
  }
  return session;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export class SessionError extends Error {}
