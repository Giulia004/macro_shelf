export interface JwtPayload {
    sub: string; //ID univoco dell'utente (UUID da Prisma)
    email: string;
    ias?: number; //Issued at
    exp?: number //Expiration
}