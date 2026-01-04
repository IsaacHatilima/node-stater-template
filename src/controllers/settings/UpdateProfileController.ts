import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";
import {profileUpdateSchema} from "../../schemas/settings";

export default async function UpdateProfileController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                status: 422,
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        await container.updateProfileService.updateProfile(parsed.data, req);
        return success(res, {
            message: "Profile Updated successfully.",
        });
    } catch (error: any) {
        next(error);
    }
}
