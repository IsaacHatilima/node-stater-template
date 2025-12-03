import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {PrismaClient} from "../generated/prisma/client";

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

const prisma = new PrismaClient();

export async function AuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return res.status(401).json({errors: ["Unauthorized"]});
    }

    try {
        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        if (decoded.jti) {
            const revoked = await prisma.refreshToken.findFirst({
                where: {
                    jti: decoded.jti,
                    revoked: true
                }
            });

            if (revoked) {
                return res.status(401).json({errors: ["Token expired"]});
            }
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.id},
            include: {profile: true},
            omit: {password: true},
        });

        if (!user) {
            return res.status(401).json({errors: ["Invalid or expired token"]});
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({errors: ["Invalid or expired session"]});
    }
}
