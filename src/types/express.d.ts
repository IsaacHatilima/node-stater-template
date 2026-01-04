import {UserDTO} from "@/dto/UserDTO";

declare global {
    namespace Express {
        interface Request {
            user?: UserDTO;
        }
    }
}

export {};
