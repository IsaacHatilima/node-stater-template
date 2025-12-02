import {PrismaClient} from "../../../generated/prisma/client";
import jwt from "jsonwebtoken";

export class ForgotPasswordTokenCheckerService {
    constructor(private db: PrismaClient) {
    }

    async checkPasswordToken(token: string) {
        const passwordToken = await this.db.passwordResetToken.findUnique({
            where: {token: token}
        });

        if (!passwordToken) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
                id: string;
                email: string;
            };
        } catch {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }

        const user = await this.db.user.findUnique({
            where: {id: decoded.id},
            select: {id: true},
        });

        if (!user) {
            throw new Error("INVALID_PASSWORD_TOKEN");
        }

        return {success: true};
    }
}