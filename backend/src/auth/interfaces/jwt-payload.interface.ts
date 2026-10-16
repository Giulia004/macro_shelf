export interface JwtPayload {
    sub: string; // ID univoco dell'utente (UUID da Prisma)
    email: string;
    iat?: number; // Issued at
    exp?: number; // Expiration
}