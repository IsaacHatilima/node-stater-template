import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {clearAuthCookies} from "../../lib/auth-cookies";
import {deleted, fail} from "../../lib/response";

const deleteProfileSchema = z.object({
    password: z.string(),
});
export default async function DeleteAccountController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = deleteProfileSchema.safeParse(req.body);

        if (!parsed.success) {
            return fail(res, {
                status: 422,
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        await container.deleteAccountService.deleteAccount(parsed.data, req);

        clearAuthCookies(res);

        return deleted(res);
    } catch (error: any) {
        next(error);
    }
}
