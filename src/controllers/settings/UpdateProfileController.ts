import {z} from "zod";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

const profileUpdateSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.email(),
});
export default async function UpdateProfileController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.updateProfileService.updateProfile(parsed.data, req);
        return res.json({
            message: "Profile Updated successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
