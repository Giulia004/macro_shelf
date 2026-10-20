import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { BehaviorSubject, Observable, tap } from "rxjs";

export type Gender = 'FEMALE' | 'MALE';
export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE';
export type Goal = 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_WEIGHT';

export interface User {
    id: string;
    email: string;
    name?: string | null;
    surname?: string | null;
    gender?: Gender | null;
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    activityLevel?: ActivityLevel | null;
    goal: Goal | null;
    isOnboardingCompleted: boolean;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    isPremium: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CompleteOnboardingData {
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    activityLevel: ActivityLevel;
    goal: Goal;
}

export interface OnboardingResponse {
    message: string;
    calculatedNutrition: {
        bmr: number;
        tdee: number;
        targetCalories: number;
        targetProtein: number;
        targetCarbs: number;
        targetFats: number;
    };
    user: Partial<User>;
}

export interface UpdateGoalPayload {
    goal?: Goal;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
}

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;
    private readonly profileSubject = new BehaviorSubject<Partial<User> | null>(null);
    readonly profile$ = this.profileSubject.asObservable();

    constructor(private http: HttpClient) { }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => this.profileSubject.next(user))
        );
    }

    updateProfile(name: string, surname: string): Observable<Partial<User>> {
        return this.http.patch<Partial<User>>(`${this.apiUrl}/me`, { name, surname }).pipe(
            tap(user => this.profileSubject.next(user))
        );
    }

    updateGoalAndMacros(data: UpdateGoalPayload): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/goal`, data).pipe(
            tap(user => this.profileSubject.next(user))
        );
    }
}
