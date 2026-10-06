import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new UnauthorizedException("Token mancance o non valido");

        const token = authHeader.split(' ')[1];

        try {
            const payload = await this.jwtService.verifyAsync(token);

            //Iniettiamo il payload nell'oggetto request
            request.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException("Token non valido o scaduto");
        }
    }
}