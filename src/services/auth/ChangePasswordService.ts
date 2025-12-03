import bcrypt from "bcrypt";
import {prisma} from "../../config/db";

export class ChangePasswordService {
    async changePassword(data: { password: string; token: string; }) {
        const passwordToken = await prisma.passwordResetToken.findUnique({
            where: {token: data.token}
        });

        if (!passwordToken) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }

        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            await prisma.user.update({
                where: {id: passwordToken.userId},
                data: {password: hashedPassword},
            });

            await prisma.passwordResetToken.delete({
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