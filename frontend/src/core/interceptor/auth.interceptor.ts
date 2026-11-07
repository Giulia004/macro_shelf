import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    let clonedReq = req;
    if (token) {
        //Clono la richiesta aggiungendo all'header di autorizzazione Bearer
        const cloneReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloneReq);
    }

    //Se non c'è il token procedo con la richiesta originale
    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            //Se il token è scaduto o non valido, puliamo la sessione e lo mandiamo al login
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
}