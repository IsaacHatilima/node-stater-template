import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import jwt from "jsonwebtoken";
import {generateAccessToken, generateRefreshToken} from "../../lib/jwt";
import {env} from "../../utils/environment-variables";
import {AppError, InvalidRefreshTokenError} from "../../lib/errors";

export class RefreshTokenService {
    async refresh(refreshToken: string) {
        let stored;
        try {
            stored = await prisma.refreshToken.findUnique({
                where: {token: refreshToken}
            });
        } catch {
            throw new AppError("Failed to validate refresh token");
        }

        if (!stored || stored.revoked) {
            throw new InvalidRefreshTokenError();
        }

        let decoded: { id: string; email: string };
        try {
            decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
                id: string;
                email: string;
            };
        } catch {
            throw new InvalidRefreshTokenError();
        }

        let newRefresh: string;
        let newAccess: string;
        let newJti: string;

        try {
            newRefresh = generateRefreshToken({id: decoded.id});
            newAccess = generateAccessToken({id: decoded.id, email: decoded.email});
            newJti = (jwt.decode(newAccess) as { jti: string }).jti;
        } catch {
            throw new AppError("Failed to generate tokens");
        }

        try {
            await prisma.$transaction([
                prisma.refreshToken.update({
                    where: {token: refreshToken},
                    data: {revoked: true},
                }),
                prisma.refreshToken.create({
                    data: {
                        userId: decoded.id,
                        jti: newJti,
                        token: newRefresh,
                        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
                    },
                }),
            ]);
        } catch {
            throw new AppError("Failed to update refresh tokens");
        }

        try {
            await redis
                .multi()
                .del(`session:${stored.jti}`)
                .del(`user:${stored.userId}`)
                .setEx(
                    `session:${newJti}`,
                    60 * 5,
                    JSON.stringify({userId: decoded.id, jti: newJti})
                )
                .exec();
        } catch {
            throw new AppError("Failed to update session store");
        }

        return {
            access_token: newAccess,
            refresh_token: newRefresh,
        };
    }

}
