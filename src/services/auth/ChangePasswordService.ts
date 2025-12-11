import bcrypt from "bcrypt";
import {prisma} from "../../config/db";
import {AppError, InvalidPasswordTokenError, UserNotFoundError} from "../../lib/errors";

export class ChangePasswordService {
    async changePassword(data: { token: string, password: string }) {
        const passwordToken = await prisma.passwordResetToken.findUnique({
            where: {token: data.token}
        });
        if (!passwordToken) {
            throw new InvalidPasswordTokenError();
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        try {
            await prisma.user.update({
                where: {id: passwordToken.userId},
                data: {password: hashedPassword},
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new UserNotFoundError();
            }
            throw new AppError("Internal server error");
        }

        try {
            await prisma.passwordResetToken.delete({
                where: {token: data.token},
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new InvalidPasswordTokenError();
            }
            throw new AppError("Internal server error");
        }
        return;
    }
}
