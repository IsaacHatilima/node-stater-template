import jwt from "jsonwebtoken";
import { redis } from "../config/redis";
import { prisma } from "../config/db";
import { toSafeUser } from "../lib/safe-user";
export async function AuthMiddleware(req, res, next) {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }
    if (!token) {
        return res.status(401).json({ errors: ["Unauthorized"] });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
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
                    return res.status(401).json({ errors: ["Token expired"] });
                }
                await redis.setEx(sessionKey, 60 * 5, JSON.stringify({
                    userId: decoded.id,
                    jti: decoded.jti,
                }));
            }
        }
        const userCacheKey = `user:${decoded.id}`;
        const cachedUser = await redis.get(userCacheKey);
        let user;
        if (cachedUser) {
            user = JSON.parse(cachedUser);
        }
        else {
            user = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { profile: true },
            });
            if (!user) {
                return res.status(401).json({ errors: ["Invalid or expired token"] });
            }
            await redis.setEx(userCacheKey, 60 * 5, JSON.stringify(toSafeUser(user)));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ errors: ["Invalid or expired session"] });
    }
}
