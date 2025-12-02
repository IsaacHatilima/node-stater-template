import {PrismaClient} from "../../../generated/prisma/client";
import bcrypt from "bcrypt";

export class ChangePasswordService {
    constructor(private db: PrismaClient) {
    }

    async changePassword(data: { password: string; token: string; }) {
        const passwordToken = await this.db.passwordResetToken.findUnique({
            where: {token: data.token}
        });

        if (!passwordToken) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }

        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            await this.db.user.update({
                where: {id: passwordToken.userId},
                data: {password: hashedPassword},
            });

            await this.db.passwordResetToken.delete({
                where: {token: data.token},
            });

            return {success: true};
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new Error("USER_NOT_FOUND");
            }

            throw new Error("FAILED_TO_CHANGE_PASSWORD");
        }
    }
}