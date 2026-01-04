import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

export default async function ForgotPasswordTokenCheckerController(req: Request, res: Response, next: NextFunction) {
    const token = req.query.token as string;

    if (!token) {
        return fail(res, {message: "Missing Token"});
    }

    try {
        await container.forgotPasswordTokenCheckerService.checkPasswordToken(token);
        return success(res, {message: "Token is valid"});
    } catch (error) {
        next(error);
    }
}
