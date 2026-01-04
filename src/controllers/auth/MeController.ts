import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {success} from "../../lib/response";

export default async function MeController(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await container.meService.getMe(req.user.public_id);
        return success(res, {
            data: {user}
        }); // @safe
    } catch (error) {
        next(error);
    }
}
