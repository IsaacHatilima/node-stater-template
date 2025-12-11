import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {Request} from "express";
import {InvalidPasswordError, UpdatePasswordError, UserNotFoundError} from "../../lib/errors";

export class UpdatePasswordService {
    async updatePassword(data: { current_password: string; password: string }, reqUser: Request) {
        const user = await prisma.user.findUnique({
            where: {id: reqUser.user.id},
        });

        if (!user) throw new UserNotFoundError();

        const valid = await bcrypt.compare(data.current_password, user.password);
        if (!valid) {
            throw new InvalidPasswordError();
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        try {
            await prisma.user.update({
                where: {id: user.id},
                data: {password: hashedPassword},
            });
        } catch {
            throw new UpdatePasswordError();
        }

        return {ok: true};
    }
}
