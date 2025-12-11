import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

const deleteProfileSchema = z.object({
    password: z.string(),
});
export default async function DeleteAccountController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = deleteProfileSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        await container.deleteAccountService.deleteAccount(parsed.data, req);
        
        return res.json({
            message: "Profile Deleted successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
