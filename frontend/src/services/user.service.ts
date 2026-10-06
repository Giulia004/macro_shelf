import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { BehaviorSubject, Observable, tap } from "rxjs";

export interface User {
    id: string;
    email: string;
    name?: string | null;
    surname?: string | null;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
    goal?: string;
    isPremium?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;
    private readonly profileSubject = new BehaviorSubject<User | null>(null);
    readonly profile$ = this.profileSubject.asObservable();

    constructor(private http: HttpClient) { }

    public getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`, { headers: this.getHeaders() }).pipe(
            tap(user => this.profileSubject.next(user))
        );
    }

    updateProfile(name: string, surname: string): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/me`, { name, surname }, { headers: this.getHeaders() }).pipe(
            tap(user => this.profileSubject.next(user))
        );
    }

    updateGoalAndMacros(data: { goal?: string; targetCalories?: number; targetProtein?: number; targetCarbs?: number; targetFats?: number }): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/goal`, data, { headers: this.getHeaders() }).pipe(
            tap(user => this.profileSubject.next(user))
        )
    };
}