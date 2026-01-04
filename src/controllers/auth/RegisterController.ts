import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {created, fail} from "../../lib/response";
import {registerSchema} from "../../schemas/auth";
import {RegisterRequestDTO} from "../../dtos/command/RegisterRequestDTO";

export default async function RegisterController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return fail(res, {
                errors: parsed.error.issues.map((i) => i.message),
            });
        }
        const dto = RegisterRequestDTO.fromParsed(parsed.data);

        const user = await container.registerService.register(dto);
        return created(res, {
            message: 'Registered successfully.',
            data: user,
        });

    } catch (error: any) {
        next(error);
    }
}
