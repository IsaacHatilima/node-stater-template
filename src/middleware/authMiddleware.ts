import jwt from "jsonwebtoken";
import {prisma} from "../config/db";
import {NextFunction, Request, Response} from "express";
import {env} from "../utils/environment-variables";
import {UserDTO} from "../dtos/read/UserReadDTO";
import {redis} from "../config/redis";
import {fail} from "../lib/response";

export async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return fail(res, {status: 401, errors: ["Unauthorized"]});
    }

    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: number; }

        const userCacheKey = `user:${decoded.id}`;
        const cachedUser = await redis.get(userCacheKey);
        let user;

        if (cachedUser) {
            user = JSON.parse(cachedUser);
        } else {
            user = await prisma.user.findUnique({
                where: {id: decoded.id},
                include: {profile: true},
            });

            if (!user) {
                return fail(res, {
                    status: 401,
                    errors: ["Invalid or expired token"],
                });
            }

            await redis.setEx(
                `user:${user.id}`,
                60 * 5,
                JSON.stringify(new UserDTO(user))
            );
        }

        req.user = new UserDTO(user);
        next();

    } catch (error) {
        return fail(res, {status: 401, errors: ["Invalid or expired session"]});
    }
}
