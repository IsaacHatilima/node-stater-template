import {PrismaClient} from "../../../generated/prisma/client";
import {container} from "../../lib/container";
import {buildEmailTemplate, sendMail} from "../../lib/mailer";

export class ForgotPasswordService {
    constructor(private db: PrismaClient) {
    }

    async requestLink(data: {
        email: string;
    }) {
        const user = await this.db.user.findFirst({
            where: {email: data.email},
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

        const verificationToken =
            container.emailVerificationService.generateVerificationToken(
                user.id,
                user.email
            );

        const verificationUrl = `${process.env.APP_URL}/check-password-reset-token?token=${verificationToken}`;

        await this.db.passwordResetToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
            }
        });

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

        return {success: true};
    }
}