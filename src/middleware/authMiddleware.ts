import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {PrismaClient} from "../generated/prisma/client";
import {redis} from "../config/redis";

const prisma = new PrismaClient();

export async function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return res.status(401).json({errors: ["Unauthorized"]});
    }

    try {
        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        if (decoded.jti) {
            const sessionKey = `session:${decoded.jti}`;
            const session = await redis.get(sessionKey);

            if (!session) {
                const revoked = await prisma.refreshToken.findFirst({
                    where: {
                        jti: decoded.jti,
                        revoked: true
                    }
                });

                if (revoked) {
                    return res.status(401).json({errors: ["Token expired"]});
                }

                await redis.setEx(
                    sessionKey,
                    60 * 5,
                    JSON.stringify({
                        userId: decoded.id,
                        jti: decoded.jti,
                    })
                );
            }
        }

        const userCacheKey = `user:${decoded.id}`;
        const cachedUser = await redis.get(userCacheKey);
        let user;

        if (cachedUser) {
            user = JSON.parse(cachedUser);
        } else {
            user = await prisma.user.findUnique({
                where: {id: decoded.id},
                include: {profile: true},
                omit: {password: true},
            });

            if (!user) {
                return res.status(401).json({errors: ["Invalid or expired token"]});
            }

            await redis.setEx(userCacheKey, 60 * 5, JSON.stringify(user));
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({errors: ["Invalid or expired session"]});
    }
}
