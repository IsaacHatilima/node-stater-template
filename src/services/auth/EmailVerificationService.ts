import jwt from "jsonwebtoken";
import {prisma} from "../../config/db";

export class EmailVerificationService {
    generateVerificationToken(userId: string, email: string) {
        return jwt.sign(
            {id: userId, email},
            process.env.JWT_SECRET as string,
            {expiresIn: "1h"}
        );
    }

    async verifyEmail(token: string) {
        let decoded: { id: string; email: string };

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as { id: string; email: string };
        } catch {
            throw new Error("INVALID_OR_EXPIRED_TOKEN");
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.id}
        });

        if (!user) throw new Error("USER_NOT_FOUND");
        if (user.email_verified_at) throw new Error("ALREADY_VERIFIED");

        await prisma.user.update({
            where: {id: decoded.id},
            data: {email_verified_at: new Date()}
        });

        return true;
    }
}
