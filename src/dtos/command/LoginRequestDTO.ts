export class LoginRequestDTO {
    readonly email: string;
    readonly password: string;

    private constructor(
        email: string,
        password: string
    ) {
        this.email = email;
        this.password = password;
    }

    static fromParsed(input: {
        email: string;
        password: string;
    }): LoginRequestDTO {
        return new LoginRequestDTO(
            input.email.trim().toLowerCase(),
            input.password.trim()
        );
    }
}