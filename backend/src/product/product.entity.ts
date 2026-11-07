import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    brand: string;

    @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
    barcode: string;

    @Column({ type: 'varchar', length: 20, default: 'g' })
    unit: string;

    //Macronutriento principali per 100g/ml
    @Column({ type: 'float', default: 0 })
    calories: number;

    @Column({ type: 'float', default: 0 })
    proteins: number;

    @Column({ type: 'float', default: 0 })
    carbs: number;

    @Column({ type: 'float', default: 0 })
    fats: number;

    @Column({ type: 'float', nullable: true })
    sugar: number;

    @Column({ type: 'float', nullable: true })
    saturatedFat: number;
    @Column({ type: 'float', nullable: true })
    fiber: number;

    @Column({ type: 'float', nullable: true })
    salt: number;

    @Column({ type: 'varchar', nullable: false })
    category: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl: string;
}