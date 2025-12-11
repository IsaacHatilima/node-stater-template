import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

export default async function MeController(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await container.meService.getMe(req.user.id);
        return res.json({user}); // @safe
    } catch (error) {
        next(error);
    }
}
