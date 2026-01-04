import {Response} from 'express';

/**
 * Base response shape
 */
type BaseResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T | null;
    meta?: Record<string, unknown> | null;
    errors?: string[] | null;
    status?: number;
};

/**
 * Core response orchestrator
 * (Laravel-style respond())
 */
function respond<T>(
    res: Response,
    {
        success,
        message,
        data = null,
        meta = null,
        errors = null,
        status = 200,
    }: BaseResponse<T>
) {
    return res.status(status).json({
        success,
        message,
        data,
        meta,
        errors,
    });
}

/**
 * 200 OK — Standard success response
 */
export function success<T>(
    res: Response,
    {
        message = 'Success',
        data = null,
        meta = null,
        status = 200,
    }: Omit<BaseResponse<T>, 'success' | 'errors'> = {}
) {
    return respond(res, {
        success: true,
        message,
        data,
        meta,
        status,
    });
}

/**
 * 201 Created — Resource created
 */
export function created<T>(
    res: Response,
    {
        message = 'Resource created successfully',
        data,
    }: { message?: string; data: T }
) {
    return respond(res, {
        success: true,
        message,
        data,
        status: 201,
    });
}

/**
 * 204 No Content — Resource deleted
 */
export function deleted(res: Response) {
    return res.status(204).send();
}

/**
 * Error response helper
 */
export function fail(
    res: Response,
    {
        message = 'Bad request',
        status = 400,
        errors = null,
    }: {
        message?: string;
        status?: number;
        errors?: string[] | null;
    } = {}
) {
    return respond(res, {
        success: false,
        message,
        errors,
        status,
    });
}
