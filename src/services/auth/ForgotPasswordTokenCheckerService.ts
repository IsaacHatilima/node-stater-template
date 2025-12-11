import {prisma} from "../../config/db";
import jwt from "jsonwebtoken";
import {env} from "../../utils/environment-variables";
import {InvalidPasswordTokenError} from "../../lib/errors";

export class ForgotPasswordTokenCheckerService {
    async checkPasswordToken(token: string) {
        const passwordToken = await prisma.passwordResetToken.findUnique({
            where: {token},
            select: {userId: true},
        });

        if (!passwordToken) {
            throw new InvalidPasswordTokenError();
        }

        let decoded: { id: string };
        try {
            decoded = jwt.verify(token, env.APP_KEY) as { id: string };
        } catch {
            throw new InvalidPasswordTokenError();
        }

        if (decoded.id !== passwordToken.userId) {
            throw new InvalidPasswordTokenError();
        }

        const userExists = await prisma.user.count({
            where: {id: decoded.id}
        });

        if (!userExists) {
            throw new InvalidPasswordTokenError();
        }

        return;
    }
}
