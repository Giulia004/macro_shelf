import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    //Recupero del token salvato nel localstorage
    const token = localStorage.getItem('access_token');

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
    return next(req);
}