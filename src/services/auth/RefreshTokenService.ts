import {prisma} from "../../config/db";
import jwt from "jsonwebtoken";
import {refreshAccessToken, refreshRefreshToken} from "../../lib/jwt";

export class RefreshTokenService {
    async refresh(refreshToken: string) {
        const stored = await prisma.refreshToken.findUnique({
            where: {token: refreshToken}
        });

        if (!stored || stored.revoked) {
            throw new Error("INVALID_REFRESH_TOKEN");
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as {
                id: string;
                email: string;
            };
        } catch {
            throw new Error("INVALID_REFRESH_TOKEN");
        }

        const newRefresh = refreshRefreshToken({id: decoded.id, email: decoded.email});

        const newAccess = refreshAccessToken({id: decoded.id, email: decoded.email});

        const {jti} = jwt.decode(newAccess) as any;

        await prisma.refreshToken.update({
            where: {token: refreshToken},
            data: {revoked: true}
        });


        await prisma.refreshToken.create({
            data: {
                userId: decoded.id,
                jti,
                token: newRefresh,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
            }
        });

        return {
            access_token: newAccess,
            refresh_token: newRefresh
        };
    }
}
