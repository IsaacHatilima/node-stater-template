import {NextFunction, Request, Response} from "express";
import {logger} from "../lib/logger";
import {AppError} from "../lib/errors";
import {parsePrismaError, parseStack} from "../lib/parse-stack";
import {env} from "../utils/environment-variables";
import {fail} from "../lib/response";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const isProd = env.NODE_ENV === "production";

    // Expected / domain errors
    if (err instanceof AppError) {
        logger.warn(
            {
                status: err.status,
                path: req.path,
                message: err.message,
            },
            "Handled application error"
        );

        return fail(res, {
            status: err.status,
            errors: [err.message],
        });
    }

    // Unknown / infra / programmer errors
    const prismaInfo =
        (err as any).code?.startsWith("P")
            ? parsePrismaError(err)
            : undefined;

    logger.error(
        {
            path: req.path,
            code: (err as any).code,
            prisma: prismaInfo,
            stack: isProd ? undefined : parseStack(err.stack),
        },
        "Unhandled error"
    );

    return fail(res, {
        status: 500,
        errors: ["Internal server error"],
    });
}

