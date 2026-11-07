import { Injectable, signal } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Gender, User } from "./user.service";

export interface AuthResponse {
    access_token: string;
    user: Pick<User, 'id' | 'email' | 'name' | 'surname'>;
}

@Injectable({
    providedIn: "root",
})

export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSignal = signal<Partial<User> | null>(null);

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

    register(email: string, password: string, name: string, surname: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { email, password, name, surname });
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
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
        localStorage.setItem('user_profile', JSON.stringify(user));
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