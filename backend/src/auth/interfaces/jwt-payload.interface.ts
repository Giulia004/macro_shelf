export interface JwtPayload {
    sub: number; // ID univoco dell'utente
    email: string;
    iat?: number; // Issued at
    exp?: number; // Expiration
}