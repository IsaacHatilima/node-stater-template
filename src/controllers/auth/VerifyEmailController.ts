import {container} from "../../lib/container";
import {Request, Response} from "express";
import {fail, success} from "../../lib/response";

export default async function VerifyEmailController(req: Request, res: Response) {
    try {
        const {token} = req.query as { token: string };
        if (!token) {
            return fail(res, {
                status: 422,
                errors: ["Verification token missing"]
            });
        }
        await container.emailVerificationService.verifyEmail(token);
        return success(res, {
            message: "Email successfully verified."
        });
    } catch (error: any) {
        const msg = error.message;
        if (msg === "INVALID_OR_EXPIRED_TOKEN")
            return fail(res, {errors: ["Invalid or expired token"]});
        if (msg === "ALREADY_VERIFIED")
            return fail(res, {errors: ["Email already verified"]});
        if (msg === "USER_NOT_FOUND")
            return fail(res, {status: 404, errors: ["User not found"]});
        return fail(res, {status: 500, message: "Something went wrong"});
    }
}
