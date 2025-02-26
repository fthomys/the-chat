import { getSession } from "@/util/SessionAdapter";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
    const protectedRoutes: String[] = [];

    if (protectedRoutes.includes(event.node.req.url || "")) {
        const token = getCookie(event, "session_token");
        if (!token || !(await getSession(token))) {
            return sendError(event, createError({ statusCode: 401, data: { message: "Unauthorized: No session token provided. You must be logged in to access this resource." } }));
        }
    }
});
