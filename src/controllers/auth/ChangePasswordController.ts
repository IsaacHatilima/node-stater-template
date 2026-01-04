import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

const passwordChangeSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
});
export default async function ChangePasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = passwordChangeSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                status: 422,
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        const token = req.query.token as string;
        if (!token) {
            return fail(res, {message: "Invalid or expired token"});
        }

        await container.changePasswordService.changePassword({
            password: req.body.password,
            token: token,
        });
        return success(res, {
            message: "Password changed successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
