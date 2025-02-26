import { prisma } from "@/util/db";
import redis from "@/util/redis";
import { randomBytes } from "crypto";

const SESSION_EXPIRATION_HOURS = 144;

export async function createSession(userId: string, userAgent: string, ip: string) {
    const token = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000);

    const session = await prisma.session.create({
        data: { userId, token, useragent: userAgent, ip, expiresAt },
    });

    await redis.set(`session:${token}`, JSON.stringify({ userId }), "EX", SESSION_EXPIRATION_HOURS * 60 * 60);

    return token;
}

export async function getSession(token: string) {
    const cachedSession = await redis.get(`session:${token}`);
    if (cachedSession) {
        return JSON.parse(cachedSession);
    }

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session || new Date() > new Date(session.expiresAt)) {
        return null;
    }

    await redis.set(`session:${token}`, JSON.stringify({ userId: session.userId }), "EX", SESSION_EXPIRATION_HOURS * 60 * 60);

    return { userId: session.userId };
}

export async function deleteSession(token: string) {
    await prisma.session.deleteMany({ where: { token } });
    await redis.del(`session:${token}`);
}
