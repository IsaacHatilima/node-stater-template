import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

const forgotPasswordSchema = z.object({
    email: z.email(),
});
export default async function ForgotPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        await container.forgotPasswordService.requestLink(req.body);
        return res.json({
            message: "A reset link has been sent to your email.",
        });
    } catch (error: any) {
        next(error);
    }
}
