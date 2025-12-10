import { prisma } from "../../config/db";
import bcrypt from "bcrypt";
import { redis } from "../../config/redis";
export class DeleteAccountService {
    async deleteAccount(data, reqUser) {
        const user = await prisma.user.findFirst({
            where: { id: reqUser.id },
        });
        const valid = await bcrypt.compare(data.password, user.password);
        if (!valid) {
            throw new Error("INVALID_PASSWORD");
        }
        const jtiRecord = await prisma.refreshToken.findFirst({
            where: {
                userId: reqUser.id,
                revoked: false
            }
        });
        await redis
            .multi()
            .del(`session:${jtiRecord.jti}`)
            .del(`user:${reqUser.id}`)
            .exec();
        try {
            await prisma.user.delete({
                where: { id: reqUser.id },
            });
            return { success: true };
        }
        catch (error) {
            throw error;
        }
    }
}
