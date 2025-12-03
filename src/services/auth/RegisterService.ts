import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {normalizeEmail, toTitleCase} from "../../utils/string";
import {container} from "../../lib/container";
import {buildEmailTemplate, sendMail} from "../../lib/mailer";

export class RegisterService {
    async register(data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
    }) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await prisma.user.upsert({
                where: {
                    email: normalizeEmail(data.email),
                },
                update: {},
                create: {
                    email: normalizeEmail(data.email),
                    password: hashedPassword,
                    profile: {
                        create: {
                            first_name: toTitleCase(data.first_name),
                            last_name: toTitleCase(data.last_name),
                        },
                    },
                },
                include: {profile: true},
                omit: {password: true},
            });


            const verificationToken =
                container.emailVerificationService.generateVerificationToken(
                    user.id,
                    user.email
                );

            const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

            await sendMail(
                user.email,
                "Verify your email",
                buildEmailTemplate({
                    name: user.profile?.first_name ?? "there",
                    message: "Please verify your email by clicking the button below.",
                    url: verificationUrl,
                    buttonText: "Verify Email",
                })
            );

            return user;

        } catch (error: any) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                throw new Error("EMAIL_TAKEN");
            }
            throw error;
        }
    }
}


