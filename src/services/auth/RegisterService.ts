import "dotenv/config";
import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {normalizeEmail, normalizeName} from "../../utils/string";
import {container} from "../../lib/container";
import {buildEmailTemplate, sendMail} from "../../lib/mailer";
import {toSafeUser} from "../../lib/safe-user";
import {AppError, EmailTakenError} from "../../lib/errors";

export class RegisterService {
    async register(data: { email: string; password: string; first_name: string; last_name: string; }) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const user = await prisma.user.create({
                data: {
                    email: normalizeEmail(data.email),
                    password: hashedPassword,
                    profile: {
                        create: {
                            first_name: normalizeName(data.first_name),
                            last_name: normalizeName(data.last_name),
                        },
                    },
                },
                include: {profile: true},
            });
            const verificationToken = container.emailVerificationService.generateVerificationToken(user.id, user.email);
            const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

            await sendMail(user.email, "Verify your email", buildEmailTemplate({
                name: user.profile?.first_name ?? "there",
                message: "Please verify your email by clicking the button below.",
                url: verificationUrl,
                buttonText: "Verify Email",
            }));
            
            return toSafeUser(user);
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new EmailTakenError();
            }
            throw new AppError("Internal server error");
        }
    }
}
