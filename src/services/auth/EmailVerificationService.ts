import "dotenv/config";
import jwt from "jsonwebtoken";
import {prisma} from "../../config/db";
import {env} from "../../utils/environment-variables";

export class EmailVerificationService {
    generateVerificationToken(userId: string, email: string) {
        return jwt.sign({id: userId, email}, env.APP_KEY, {expiresIn: "1h"});
    }

    async verifyEmail(token: string) {
        let decoded;
        try {
            decoded = jwt.verify(token, env.APP_KEY) as { id: string }
        } catch {
            throw new Error("INVALID_OR_EXPIRED_TOKEN");
        }
        const user = await prisma.user.findUnique({
            where: {id: decoded.id}
        });
        if (!user)
            throw new Error("USER_NOT_FOUND");
        if (user.email_verified_at)
            throw new Error("ALREADY_VERIFIED");

        try {
            await prisma.user.update({
                where: {id: decoded.id},
                data: {email_verified_at: new Date()}
            });
            return true;
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new Error("USER_NOT_FOUND");
            }
            throw new Error("SERVER_ERROR");
        }


    }
}
