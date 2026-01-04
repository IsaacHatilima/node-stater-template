import {toTitleCase} from "../../utils/string";

export class RegisterRequestDTO {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;

    private constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    static fromParsed(input: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
    }): RegisterRequestDTO {
        return new RegisterRequestDTO(
            toTitleCase(input.first_name.trim()),
            toTitleCase(input.last_name.trim()),
            input.email.trim().toLowerCase(),
            input.password.trim()
        );
    }
}