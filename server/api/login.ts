import { prisma } from "@/util/db";
import { compare } from "bcrypt";
import { createSession } from "@/util/SessionAdapter";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    try {
        const body = await readBody(event);
        const { username, password } = body;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !(await compare(password, user.password))) {
            throw createError({ statusCode: 401, data: { message: "Invalid username or password." } });
        }

        const userAgent = getHeader(event, "user-agent") || "";
        const ip = getRequestIP(event);

        const token = await createSession(user.id, userAgent, ip);

        setCookie(event, "session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return { success: true, user: { id: user.id, username: user.username } };
    } catch (error: any) {
        return sendError(event, createError({ statusCode: error.statusCode || 500, data: error.data || { message: "Login failed." } }));
    }
});

function getRequestIP(event: H3Event) {
    return getHeader(event, "x-forwarded-for") || getHeader(event, "remote-addr") || "unknown";
}
