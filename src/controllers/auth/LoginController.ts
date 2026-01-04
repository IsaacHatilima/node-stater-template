import "dotenv/config";
import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/auth-cookies";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";
import {loginSchema} from "../../schemas/auth";
import {LoginRequestDTO} from "../../dtos/command/LoginRequestDTO";

export default async function LoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                errors: parsed.error.issues.map((i) => i.message),
            });
        }

        const dto = LoginRequestDTO.fromParsed(parsed.data);

        const result = await container.loginService.login(dto);
        if (result.two_factor_required) {
            return success(res, {
                message: "Two-factor authentication required",
                data: {
                    two_factor_required: true,
                    challenge_id: result.challenge_id,
                    user: result.user,
                }
            });
        }

        setAuthCookies(res, {
            refresh: result.refresh_token!,
            access: result.access_token!,
        });

        return success(res, {
            message: "Logged in",
            data: {
                user: result.user,
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            },
        });
    } catch (error) {
        next(error);
    }
}
