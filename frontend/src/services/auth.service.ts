import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { BehaviorSubject, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})

export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    //Stato reattivo per capire se è loggato
    public isAuthenticated = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        this.checkToken();
    }

    private checkToken() {
        const token = localStorage.getItem('access_token');
        this.isAuthenticated.next(!!token);
    }

    register(email: string, password: string, name: string, surname: string) {
        return this.http.post(`${this.apiUrl}/register`, { email, password, name, surname });
    }

    login(email: string, password: string) {
        return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap((res) => {
                localStorage.setItem('access_token', res.access_token);
                this.isAuthenticated.next(true);
            })
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        this.isAuthenticated.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}