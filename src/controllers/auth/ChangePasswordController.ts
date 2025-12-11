import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

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
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        const token = req.query.token as string;
        if (!token) {
            return res.status(400).json({error: "MISSING_TOKEN"});
        }

        await container.changePasswordService.changePassword({
            password: req.body.password,
            token: token,
        });
        return res.json({
            message: "Password changed successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
