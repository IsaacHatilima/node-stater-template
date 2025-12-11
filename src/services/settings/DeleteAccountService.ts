import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {redis} from "../../config/redis";
import {Request} from "express";
import {InvalidPasswordError, LogoutSessionError, UserDeletionError} from "../../lib/errors";

export class DeleteAccountService {
    async deleteAccount(data: { password: string }, reqUser: Request) {
        const user = await prisma.user.findUnique({
            where: {id: reqUser.user.id}
        });

        if (!user) {
            throw new InvalidPasswordError();
        }

        const valid = await bcrypt.compare(data.password, user.password);
        if (!valid) {
            throw new InvalidPasswordError();
        }

        try {
            const jtiRecord = await prisma.refreshToken.findFirst({
                where: {
                    userId: user.id,
                    revoked: false,
                },
            });

            if (jtiRecord) {
                await redis
                    .multi()
                    .del(`session:${jtiRecord.jti}`)
                    .del(`user:${user.id}`)
                    .exec();
            }
        } catch (error) {
            throw new LogoutSessionError();
        }

        try {
            await prisma.user.delete({
                where: {id: user.id},
            });
        } catch (error) {
            throw new UserDeletionError();
        }

        return {ok: true};
    }

}
