import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import jwt from "jsonwebtoken";
import {generateAccessToken, generateRefreshToken} from "../../lib/jwt";

export class RefreshTokenService {
    async refresh(refreshToken: string) {
        const stored = await prisma.refreshToken.findUnique({
            where: {token: refreshToken}
        });

        if (!stored || stored.revoked) {
            throw new Error("INVALID_OR_EXPIRED_REFRESH_TOKEN");
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
                id: string;
                email: string;
            };
        } catch {
            throw new Error("INVALID_OR_EXPIRED_REFRESH_TOKEN");
        }

        const newRefresh = generateRefreshToken({
            id: decoded.id,
            email: decoded.email
        });

        const newAccess = generateAccessToken({
            id: decoded.id,
            email: decoded.email
        });

        const {jti: newJti} = jwt.decode(newAccess) as { jti: string };

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: {token: refreshToken},
                data: {revoked: true}
            }),
            prisma.refreshToken.create({
                data: {
                    userId: decoded.id,
                    jti: newJti,
                    token: newRefresh,
                    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
                }
            })
        ]);

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

        return {
            access_token: newAccess,
            refresh_token: newRefresh
        };
    }
}
