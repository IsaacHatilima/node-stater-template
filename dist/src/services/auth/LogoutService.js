import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
export class LogoutService {
    async logout(refreshToken) {
        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken }
        });
        if (stored) {
            await prisma.refreshToken.update({
                where: { token: refreshToken },
                data: { revoked: true }
            });
            await redis
                .multi()
                .del(`session:${stored.jti}`)
                .del(`user:${stored.userId}`)
                .exec();
        }
        return true;
    }
}
