import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import {AppError} from "../../lib/errors";

export class LogoutService {
    async logout(refreshToken: string) {
        const stored = await prisma.refreshToken.findUnique({
            where: {token: refreshToken},
        });

        if (!stored) {
            return;
        }

        try {
            await prisma.refreshToken.update({
                where: {token: refreshToken},
                data: {revoked: true},
            });
        } catch (error) {
            throw new AppError("Failed to revoke refresh token.");
        }

        try {
            await redis
                .multi()
                .del(`session:${stored.jti}`)
                .del(`user:${stored.userId}`)
                .exec();
        } catch (error) {
            throw new AppError("Failed to clear session data.");
        }

        return;
    }

}
