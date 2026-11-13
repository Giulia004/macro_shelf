import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { Gender } from "./users.service.js";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    surname: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    age: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: Gender;

    @Column({ type: 'boolean', default: false })
    isPremium: boolean;

    @Column({ type: 'boolean', default: false })
    removeAds: boolean;
    
    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;

    @Column({ type: 'int', default: 2000 })
    calories: number;

    @Column({ type: 'int', default: 150 })
    proteins: number;

    @Column({ type: 'int', default: 200 })
    carbs: number;

    @Column({ type: 'int', default: 65 })
    fats: number;
}