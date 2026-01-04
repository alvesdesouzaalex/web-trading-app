export interface LoginRequest {
    email: string;
    pass: string;
}

export interface JwtAuthenticationResponse {
    accessToken: string;
    tokenType: string;
}
