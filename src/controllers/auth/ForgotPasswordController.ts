import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

const forgotPasswordSchema = z.object({
    email: z.email(),
});
export default async function ForgotPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                status: 422,
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        await container.forgotPasswordService.requestLink(req.body);
        return success(res, {
            message: "A reset link has been sent to your email.",
        });
    } catch (error: any) {
        next(error);
    }
}
