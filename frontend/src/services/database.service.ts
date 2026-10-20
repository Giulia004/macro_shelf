import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface ShoppingItem {
    id?: string;
    productId?: string;
    name: string;
    brand?: string;
    quantity?: number;
    unit?: string;
    isChecked?: boolean | number | null;
    category?: string;
    notes?: string;
    createdAt?: string;
};

export interface PantryItemRecord {
    id: string;
    productId: string;
    name: string;
    brand: string | null;
    barcode: string | null;
    imageUrl: string | null;
    quantity: number;
    expiryDate: string;
    minThreshold: number;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number | null;
    sugar: number | null;
    saturatedFat: number | null;
    salt: number | null;
    unit: string;
    category: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;
    private isDbReady: boolean = false;
    private initPromise: Promise<void> | null = null;

    constructor() { }

    async initDatabase() {
        if (this.isDbReady) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const platform = Capacitor.getPlatform();

                // Gestione specifica per il web/browser tramite JeepSQLite
                if (platform === 'web') {
                    const jeepEl = document.createElement('jeep-sqlite');
                    document.body.appendChild(jeepEl);
                    await customElements.whenDefined('jeep-sqlite');
                    await this.sqlite.initWebStore();
                }

                const consistency = await this.sqlite.checkConnectionsConsistency();
                const isConnected = (await this.sqlite.isConnection('macroshelf_local', false)).result;
                if (consistency && isConnected) {
                    this.db = await this.sqlite.retrieveConnection('macroshelf_local', false);
                } else {
                    this.db = await this.sqlite.createConnection(
                        'macroshelf_local',
                        false,
                        'no-encryption',
                        1,
                        false
                    );
                }

                const isOpen = (await this.db.isDBOpen()).result;
                if (!isOpen) {
                    await this.db.open();
                }

                // Creazione dello schema della tabella locale per la dispensa dell'utente, lista della spesa, tabella cache prodotti (per scanner barcode offline)
                //Tabella ricette preferite
                const schema = `
        CREATE TABLE IF NOT EXISTS PantryItem (
            id TEXT PRIMARY KEY NOT NULL,
            productId TEXT NOT NULL,
            name TEXT NOT NULL,
            brand TEXT,
            barcode TEXT,
            imageUrl TEXT,
            quantity REAL NOT NULL,
            expiryDate TEXT NOT NULL,
            minThreshold REAL DEFAULT 1,
            calories REAL,
            proteins REAL,
            carbs REAL,
            fats REAL,
            fiber REAL,
            sugar REAL,
            saturatedFat REAL,
            salt REAL,
            unit TEXT DEFAULT 'g',
            category TEXT
        );
         CREATE TABLE IF NOT EXISTS ShoppingList (
            id TEXT PRIMARY KEY NOT NULL,
            productId TEXT,
            name TEXT NOT NULL,
            brand TEXT,
            quantity REAL NOT NULL DEFAULT 1,
            unit TEXT DEFAULT 'pz',
            isChecked INTEGER NOT NULL DEFAULT 0,
            category TEXT,
            notes TEXT,
            createdAt TEXT NOT NULL
        );
         CREATE TABLE IF NOT EXISTS ProductCache (
            id TEXT PRIMARY KEY NOT NULL,
            barcode TEXT UNIQUE,
            name TEXT NOT NULL,
            brand TEXT,
            imageUrl TEXT,
            calories REAL NOT NULL,
            proteins REAL NOT NULL,
            carbs REAL NOT NULL,
            fats REAL NOT NULL,
            fiber REAL,
            sugar REAL,
            saturatedFat REAL,
            salt REAL,
            unit TEXT DEFAULT 'g',
            cachedAt TEXT NOT NULL
        );
         CREATE TABLE IF NOT EXISTS FavoriteRecipe (
            id TEXT PRIMARY KEY NOT NULL,
            slug TEXT NOT NULL,
            title TEXT NOT NULL,
            imageUrl TEXT,
            servings INTEGER DEFAULT 2,
            prepTimeMinutes INTEGER DEFAULT 0,
            cookTimeMinutes INTEGER DEFAULT 0,
            instructions TEXT NOT NULL,
            caloriesPerServing REAL DEFAULT 0,
            proteinsPerServing REAL DEFAULT 0,
            carbsPerServing REAL DEFAULT 0,
            fatsPerServing REAL DEFAULT 0,
            savedAt TEXT NOT NULL
        );
        `;
                await this.db.execute(schema);
                const pantryColumns = await this.db.query('PRAGMA table_info(PantryItem);');
                const existingPantryColumns = new Set(
                    (pantryColumns.values ?? []).map((column) => column.name),
                );
                const pantryColumnMigrations = [
                    ['barcode', 'TEXT'],
                    ['imageUrl', 'TEXT'],
                    ['fiber', 'REAL'],
                    ['sugar', 'REAL'],
                    ['saturatedFat', 'REAL'],
                    ['salt', 'REAL'],
                    ['category', 'TEXT'],
                ] as const;

                for (const [column, definition] of pantryColumnMigrations) {
                    if (!existingPantryColumns.has(column)) {
                        await this.db.execute(
                            `ALTER TABLE PantryItem ADD COLUMN ${column} ${definition};`,
                        );
                    }
                }

                if (platform === 'web') {
                    await this.sqlite.saveToStore('macroshelf_local');
                }
                this.isDbReady = true;
                console.log("Database SQLite locale inizializzato con successo.");
            } catch (error) {
                console.error("Errore durante l'inizializzazione di SQLite:", error);
                this.isDbReady = false;
                this.initPromise = null;
                throw error;
            }
        })();

        return this.initPromise;
    }

    // Metodo helper per il salvataggio web
    private async persistIfWeb() {
        if (Capacitor.getPlatform() === 'web') {
            await this.sqlite.saveToStore('macroshelf_local');
        }
    }

    // Metodi CRUD di base per la dispensa
    async getPantryItems(): Promise<PantryItemRecord[]> {
        if (!this.isDbReady) await this.initDatabase();

        const res = await this.db.query('SELECT * FROM PantryItem ORDER BY expiryDate ASC;');
        return res.values ?? [];
    }

    async addPantryItem(item: {
        id: string;
        productId: string;
        name: string;
        brand?: string;
        barcode?: string;
        imageUrl?: string;
        quantity: number;
        expiryDate: string;
        minThreshold?: number;
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        fiber?: number;
        sugar?: number;
        saturatedFat?: number;
        salt?: number;
        unit?: string;
        category?: string | null;
    }) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `
      INSERT INTO PantryItem (
        id, productId, name, brand, barcode, imageUrl, quantity, expiryDate, minThreshold,
        calories, proteins, carbs, fats, fiber, sugar, saturatedFat, salt, unit, category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
        const values = [
            item.id,
            item.productId,
            item.name,
            item.brand || null,
            item.barcode || null,
            item.imageUrl || null,
            item.quantity,
            item.expiryDate,
            item.minThreshold ?? 1,
            item.calories,
            item.proteins,
            item.carbs,
            item.fats,
            item.fiber ?? null,
            item.sugar ?? null,
            item.saturatedFat ?? null,
            item.salt ?? null,
            item.unit ?? 'g',
            item.category ?? null,
        ];
        const res = await this.db.run(query, values);
        await this.persistIfWeb();
        return res;
    }

    async updateQuantity(id: string, quantity: number) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `UPDATE PantryItem SET quantity=? WHERE id=?`;
        await this.db.run(query, [quantity, id]);
        await this.persistIfWeb();
    }

    async removeItem(id: string) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `DELETE FROM PantryItem WHERE id=?`;
        await this.db.run(query, [id]);
        await this.persistIfWeb();
    }

    // Estrazione ID per la feature di "Consiglio ricette"
    async getPantryProductsIds(): Promise<string[]> {
        if (!this.isDbReady) {
            await this.initDatabase();
        }

        const res = await this.db.query('SELECT DISTINCT productId FROM PantryItem WHERE quantity > 0;');
        return (res.values ?? []).map((row: any) => row.productId);
    }

    // Ricerca prodotto per ID
    async getItemByProductId(productId: string): Promise<any | null> {
        if (!this.isDbReady) await this.initDatabase();
        const res = await this.db.query('SELECT * FROM PantryItem WHERE productId=? LIMIT 1;', [productId]);
        return res.values?.[0] ?? null;
    }

    // Prodotti in scadenza nei prossimi N giorni
    async getExpiringSoonItems(daysThreshold = 3): Promise<any[]> {
        if (!this.isDbReady) await this.initDatabase();
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysThreshold);
        const dateStr = targetDate.toISOString().split('T')[0];

        const res = await this.db.query(
            'SELECT * FROM PantryItem WHERE expiryDate <= ? AND quantity > 0 ORDER BY expiryDate ASC;',
            [dateStr]
        );

        return res.values ?? [];
    }

    // Incremento o decremento della quantità
    async adjustQuantity(id: string, delta: number): Promise<void> {
        if (!this.isDbReady) await this.initDatabase();
        await this.db.run('UPDATE PantryItem SET quantity = MAX(0, quantity + ?) WHERE id = ?;', [delta, id]);
        await this.persistIfWeb();
    }

    /*Metodi ShoppingList */
    async getShopList() {
        if (!this.isDbReady) await this.initDatabase();
        const res = await this.db.query('SELECT * FROM ShoppingList ORDER BY isChecked ASC, createdAt DESC;');

        return res.values ?? [];
    }

    async addShoppingItem(item: ShoppingItem) {
        if (!this.isDbReady) await this.initDatabase();

        const id = item.id || crypto.randomUUID();
        const query = `INSERT INTO ShoppingList (id,productId, name, brand, quantity,unit,isChecked,category, notes, createdAt) VALUES (?,?,?,?,?,?,0,?,?,?)`;

        const values = [
            id,
            item.productId || null,
            item.name,
            item.brand || null,
            item.quantity ?? 1,
            item.unit ?? 'pz',
            item.category || null,
            item.notes || null,
            new Date().toISOString()
        ];

        await this.db.run(query, values);
        await this.persistIfWeb();
        return id;
    }

    //Spunta l'articolo nella lista (0 o 1)
    async toggleShoppingItem(id: string, isChecked: boolean) {
        if (!this.isDbReady) await this.initDatabase();

        await this.db.run('UPDATE ShoppingList SET isChecked=? WHERE id=?;', [isChecked ? 1 : 0, id]);
        await this.persistIfWeb();
    }

    async removeShoppingItem(id: string) {
        if (!this.isDbReady) await this.initDatabase();

        await this.db.run('DELETE FROM ShoppingList WHERE id=?', [id]);
        await this.persistIfWeb();
    }

    //Pulisce tutti gli articoli già acquistati (spuntati)
    async clearPurchasedShoppingItems() {
        if (!this.isDbReady) await this.initDatabase();
        await this.db.run('DELETE FROM ShoppingList WHERE isChecked=1');
        await this.persistIfWeb();
    }

    /*Metodi cache prodotti (Offline scanner barcode) */
    async getCachedProductByBarcode(barcode: string): Promise<any | null> {
        if (!this.isDbReady) await this.initDatabase();
        const res = await this.db.query('SELECT * FROM ProductCache WHERE barcode=? LIMIT 1;', [barcode]);
        return res.values?.[0] ?? null;
    }

    async cacheProduct(product: any): Promise<void> {
        if (!this.isDbReady) await this.initDatabase();

        const query = `
            INSERT OR REPLACE INTO ProductCache (
                id, barcode, name, brand, imageUrl, calories, proteins, carbs, fats,
                fiber, sugar, saturatedFat, salt, unit, cachedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            product.id,
            product.barcode || null,
            product.name,
            product.brand || null,
            product.imageUrl || null,
            product.calories,
            product.proteins,
            product.carbs,
            product.fats,
            product.fiber ?? null,
            product.sugar ?? null,
            product.saturatedFat ?? null,
            product.salt ?? null,
            product.unit || 'g',
            new Date().toISOString()
        ];

        await this.db.run(query, values);
        await this.persistIfWeb();
    }

    //Metodi ricette preferite (offline)
    async getFavoriteRecipes(): Promise<any[]> {
        if (!this.isDbReady) await this.initDatabase();
        const res = await this.db.query('SELECT * FROM FavoriteRecipe ORDER BY savedAt DESC;');

        return res.values ?? [];
    }

    async toggleFavoriteRecipe(recipe: any): Promise<boolean> {
        if (!this.isDbReady) await this.initDatabase();
        const existing = await this.db.query('SELECT id FROM FavoriteRecipe WHERE id=?;', [recipe.id]);

        if (existing.values && existing.values.length > 0) {
            //Se esiste allora la rimuoviamo dai preferiti
            await this.db.run('DELETE FROM FavoriteRecipe WHERE id=?;', [recipe.id]);
            await this.persistIfWeb();
            return false;
        } else {
            // Salvala offline
            const query = `
                INSERT INTO FavoriteRecipe (
                    id, slug, title, imageUrl, servings, prepTimeMinutes, cookTimeMinutes,
                    instructions, caloriesPerServing, proteinsPerServing, carbsPerServing, fatsPerServing, savedAt
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;
            const values = [
                recipe.id,
                recipe.slug,
                recipe.title,
                recipe.imageUrl || null,
                recipe.servings ?? 2,
                recipe.prepTimeMinutes ?? 0,
                recipe.cookTimeMinutes ?? 0,
                recipe.instructions || '',
                recipe.nutritionPerServing?.calories ?? 0,
                recipe.nutritionPerServing?.proteins ?? 0,
                recipe.nutritionPerServing?.carbs ?? 0,
                recipe.nutritionPerServing?.fats ?? 0,
                new Date().toISOString()
            ];
            await this.db.run(query, values);
            await this.persistIfWeb();
            return true; //Diventa preferita
        }
    }
}