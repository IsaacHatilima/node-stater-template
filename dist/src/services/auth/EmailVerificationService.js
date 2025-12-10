import "dotenv/config";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db";
export class EmailVerificationService {
    generateVerificationToken(userId, email) {
        return jwt.sign({ id: userId, email }, process.env.APP_KEY, { expiresIn: "1h" });
    }
    async verifyEmail(token) {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.APP_KEY);
        }
        catch {
            throw new Error("INVALID_OR_EXPIRED_TOKEN");
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user)
            throw new Error("USER_NOT_FOUND");
        if (user.email_verified_at)
            throw new Error("ALREADY_VERIFIED");
        await prisma.user.update({
            where: { id: decoded.id },
            data: { email_verified_at: new Date() }
        });
        return true;
    }
}
