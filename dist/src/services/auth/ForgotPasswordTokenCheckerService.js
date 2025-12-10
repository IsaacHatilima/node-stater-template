import { prisma } from "../../config/db";
import jwt from "jsonwebtoken";
export class ForgotPasswordTokenCheckerService {
    async checkPasswordToken(token) {
        const passwordToken = await prisma.passwordResetToken.findUnique({
            where: { token: token }
        });
        if (!passwordToken) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.APP_KEY);
        }
        catch {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true },
        });
        if (!user) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }
        return { success: true };
    }
}
