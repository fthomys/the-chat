import { hash } from "bcrypt";
import { prisma } from "~/util/db";
import { H3Event } from "h3";
import { validateServer } from "~/util/checkRules";
import { createSession } from "~/util/SessionAdapter";

export default defineEventHandler(async (event: H3Event) => {
    try {
        const body = await readBody(event);
        let { displayname, username, email, password, confirm_password, termsofservice } = body;

        if (!displayname) displayname = username;

        const errors = validateServer(termsofservice, displayname, username, email, password, confirm_password);
        if (errors) {
            throw createError({ statusCode: 400, data: { errors } });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });

        if (existingUser) {
            const existingErrors: Record<string, string> = {};
            if (existingUser.username === username) existingErrors.username = "Username is already taken.";
            if (existingUser.email === email) existingErrors.email = "Email is already registered.";
            return sendError(event, createError({ statusCode: 400, data: { errors: existingErrors } }));
        }

        const hashedPassword = await hash(password, 10);
        const newUser = await prisma.user.create({
            data: { displayName: displayname, username, email, password: hashedPassword },
        });

        const userAgent = getHeader(event, "user-agent") || "";
        const ip = getRequestIP(event);
        const token = await createSession(newUser.id, userAgent, ip);

        setCookie(event, "session_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        return { success: true, user: { id: newUser.id, username: newUser.username } };
    } catch (error: any) {
        return sendError(event, createError({
            statusCode: error.statusCode || 500,
            data: error.data || { message: "An unexpected error occurred." },
        }));
    }
});

function getRequestIP(event: H3Event) {
    return getHeader(event, "x-forwarded-for") || getHeader(event, "remote-addr") || "unknown";
}
