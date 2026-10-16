import { ActivityLevel, Gender, Goal } from "@prisma/client";
//Helper per la formula nutrizionale
export interface CalculatedNutrition {
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
}

export class NutritionCalculator {
    //Calcolo BMR e TDEE per la ripartizione ideale dei Macronutrienti
    static calculate(gender: Gender, age: number, heightCm: number, weightKg: number,activityLevel:ActivityLevel, goal: Goal):CalculatedNutrition {
        //Calcolo BMR (Metabolismo Basale) con Mifflin-St Jeor
        let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
        bmr = gender === Gender.MALE ? bmr + 5 : bmr - 161;

        //Moltiplicatore per il livello di attività fisica (PAL)
        const activityMultipliers: Record<ActivityLevel, number> = {
            [ActivityLevel.SEDENTARY]: 1.2,
            [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
            [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
            [ActivityLevel.VERY_ACTIVE]: 1.725,
        };

        const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

        //Aggiustiamo in base all'obiettivo
        let targetCalories = tdee;
        if (goal === Goal.LOSE_WEIGHT) {
            targetCalories = Math.round(tdee * 0.82) //Deficit del 18%
        } else if (goal === Goal.GAIN_WEIGHT) {
            targetCalories=Math.round(tdee*1.12) //Surplus del 12%
        }

        //Mai scendere sotto il BMR di base
        if (targetCalories < Math.round(bmr))
            targetCalories = Math.round(bmr);

        //Ripartizione dei macronutrienti
        //Proteine: 2g per kg di peso corporeo (4 kcal/g)
        const targetProteinGrams = Math.round(weightKg * 2.0);
        const proteinCalories = targetProteinGrams * 4;

        //Grassi: 28% delle calorie totali (9 kcal/g)
        const targetFatsGrams = Math.round((targetCalories * 0.28) / 9);
        const fatCalories = targetFatsGrams * 9;

        //Carboidrati
        const remainingCalories = targetCalories - (proteinCalories + fatCalories);
        const targetCarbsGrams = Math.max(50, Math.round(remainingCalories / 4));

        return {
            bmr: Math.round(bmr),
            tdee,
            targetCalories,
            targetProtein: targetProteinGrams,
            targetCarbs: targetCarbsGrams,
            targetFats: targetFatsGrams
        };
    }
}