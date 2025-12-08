import "dotenv/config";
import {randomUUID} from "crypto";
import jwt, {SignOptions} from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"];
const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

interface JwtPayload {
    id: string;
    email: string;
}

export function generateAccessToken(payload: any) {
    return jwt.sign(
        {
            ...payload,
            jti: randomUUID(),
        },
        accessSecret,
        {expiresIn: accessExpires});
}

export function generateRefreshToken(payload: any) {
    return jwt.sign(payload, refreshSecret, {expiresIn: refreshExpires});
}

export function refreshAccessToken(payload: JwtPayload) {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as "15m") || "15m",
    };

    return jwt.sign(
        {
            ...payload,
            jti: randomUUID(),
        },
        accessSecret, options);
}

export function refreshRefreshToken(payload: JwtPayload) {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as "7d") || "7d",
    };

    return jwt.sign(payload, refreshSecret, options);
}