import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { BehaviorSubject, Observable, of, tap } from "rxjs";

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
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    isPremium: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface NutritionGoalDto {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
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
            tap(user => {
                const profile = this.profileSubject.value;
                this.profileSubject.next(profile ? { ...profile, ...user } : user);
            })
        );
    }

    getNutritionGoals(): Observable<NutritionGoalDto> {
        const profile = this.profileSubject.value;
        if (profile &&
            typeof profile.calories === 'number' &&
            typeof profile.proteins === 'number' &&
            typeof profile.carbs === 'number' &&
            typeof profile.fats === 'number') {
            return of({
                calories: profile.calories,
                proteins: profile.proteins,
                carbs: profile.carbs,
                fats: profile.fats
            });
        }

        return this.http.get<NutritionGoalDto>(`${this.apiUrl}/nutrition-goals`);
    }

    updateNutritionGoals(data: NutritionGoalDto): Observable<NutritionGoalDto> {
        return this.http.put<NutritionGoalDto>(`${this.apiUrl}/nutrition-goals`, data).pipe(
            tap(goals => {
                const profile = this.profileSubject.value;
                if (profile) {
                    this.profileSubject.next({ ...profile, ...goals });
                }
            })
        );
    }
}
