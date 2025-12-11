import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

export default async function ForgotPasswordTokenCheckerController(req: Request, res: Response, next: NextFunction) {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({errors: "Missing Token"});
    }

    try {
        const result = await container.forgotPasswordTokenCheckerService.checkPasswordToken(token);
        return res.json(result);
    } catch (error) {
        next(error);
    }
}
