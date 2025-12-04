import {Profile, User} from "../generated/prisma/client";

declare global {
    namespace Express {
        interface Request {
            user: Omit<User, "password"> & { profile: Profile };
        }
    }
}

export {};
