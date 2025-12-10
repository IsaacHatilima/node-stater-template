import "dotenv/config";
import { prisma } from "../../config/db";
import { container } from "../../lib/container";
import { buildEmailTemplate, sendMail } from "../../lib/mailer";
export class ForgotPasswordService {
    async requestLink(data) {
        const user = await prisma.user.findFirst({
            where: { email: data.email },
            omit: {
                password: true
            },
            include: {
                profile: true
            },
        });
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }
        const verificationToken = container.emailVerificationService.generateVerificationToken(user.id, user.email);
        const verificationUrl = `${process.env.APP_URL}/auth/check-password-reset-token?token=${verificationToken}`;
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
            }
        });
        await sendMail(user.email, "Password Reset", buildEmailTemplate({
            name: user.profile?.first_name ?? "there",
            message: "Click the button below to set a new password.",
            url: verificationUrl,
            buttonText: "Set Password",
        }));
        return { success: true };
    }
}
