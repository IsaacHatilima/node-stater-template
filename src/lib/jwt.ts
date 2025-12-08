import "dotenv/config";
import {randomUUID} from "crypto";
import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as jwt.SignOptions["expiresIn"];
const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

interface JwtPayload {
    id: string;
    email: string;
}

export function generateAccessToken(payload: JwtPayload) {
    return jwt.sign(
        {
            ...payload,
            jti: randomUUID(),
        },
        accessSecret,
        {expiresIn: accessExpires});
}

export function generateRefreshToken(payload: JwtPayload) {
    return jwt.sign(
        {
            ...payload,
            jti: randomUUID(),
        },
        refreshSecret,
        {expiresIn: refreshExpires}
    );
}
