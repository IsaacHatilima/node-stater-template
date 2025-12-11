import "dotenv/config";
import {prisma} from "../../config/db";
import {container} from "../../lib/container";
import {buildEmailTemplate, sendMail} from "../../lib/mailer";
import {env} from "../../utils/environment-variables";
import {AppError, PasswordResetCreationError, PasswordResetEmailError, UserNotFoundError} from "../../lib/errors";

export class ForgotPasswordService {
    async requestLink(data: { email: string }) {
        const user = await prisma.user.findFirst({
            where: {email: data.email},
            omit: {
                password: true
            },
            include: {
                profile: true
            },
        });
        if (!user) {
            throw new UserNotFoundError();
        }
        const verificationToken = container.emailVerificationService.generateVerificationToken(user.id, user.email);
        const verificationUrl = `${env.APP_URL}/auth/check-password-reset-token?token=${verificationToken}`;

        try {
            await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    token: verificationToken,
                },
            });
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new PasswordResetCreationError();
            }

            throw new AppError("Internal server error");
        }

        try {
            await sendMail(
                user.email,
                "Password Reset",
                buildEmailTemplate({
                    name: user.profile?.first_name ?? "there",
                    message: "Click the button below to set a new password.",
                    url: verificationUrl,
                    buttonText: "Set Password",
                })
            );
        } catch (error) {
            throw new PasswordResetEmailError();
        }
        return;
    }
}
