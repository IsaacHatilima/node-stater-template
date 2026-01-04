import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";
import {passwordUpdateSchema} from "../../schemas/settings";

export default async function UpdatePasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = passwordUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                status: 422,
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.updatePasswordService.updatePassword(parsed.data, req);
        return success(res, {
            message: "Password changed successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
