import { Injectable, signal } from "@angular/core";
import { environment } from "../environments/environment";
import { BehaviorSubject, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.service";

@Injectable({
    providedIn: "root",
})

export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSignal = signal<User | null>(null);

    //Pubblico di sola lettura per i componenti
    readonly currentUser = this.currentUserSignal.asReadonly();

    //Signal per capire se l'utente è loggato
    readonly isAuthenticated = signal<boolean>(false);

    constructor(private http: HttpClient) {
        this.checkToken();
    }

    private checkToken() {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user_profile');

        if (token && savedUser) {
            try {
                const user = JSON.parse(savedUser);
                this.currentUserSignal.set(user);
                this.isAuthenticated.set(true);
            } catch (e) {
                this.logout();
            }
        }
    }

    register(email: string, password: string, name: string, surname: string) {
        return this.http.post(`${this.apiUrl}/register`, { email, password, name, surname });
    }

    login(email: string, password: string) {
        return this.http.post<{ access_token: string, user?: User }>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap((res) => {
                localStorage.setItem('access_token', res.access_token);

                if (res.user) {
                    localStorage.setItem('user_profile', JSON.stringify(res.user));
                    this.currentUserSignal.set(res.user);
                }
                this.isAuthenticated.set(true);
            })
        );
    }

    setUserProfile(user: User) {
        localStorage.setItem('ser_profile', JSON.stringify(user));
        this.currentUserSignal.set(user);
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_profile');
        this.currentUserSignal.set(null);
        this.isAuthenticated.set(false);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }
}