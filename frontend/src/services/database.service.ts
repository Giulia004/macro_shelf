import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;
    private isDbReady: boolean = false;

    constructor() {}

    async initDatabase() {
        if (this.isDbReady) return;

        try {
            const platform = Capacitor.getPlatform();

            //Gestione specifica per il web/browser tramite JeepSQLite
            if (platform === 'web') {
                const jeepEl = document.createElement('jeep-sqlite');
                document.body.appendChild(jeepEl);
                await customElements.whenDefined('jeep-sqlite');
                await this.sqlite.initWebStore();
            }

            this.db = await this.sqlite.createConnection(
                'macroshelf_local',
                false,
                'no-encryption',
                1,
                false
            );

            await this.db.open();

            //Creazione dello schema della tabella locale per la dispensa dell'utente
            const schema = `
        CREATE TABLE IF NOT EXISTS PantryItem (
          id TEXT PRIMARY KEY NOT NULL,
          productId TEXT NOT NULL,
          name TEXT NOT NULL,
          brand TEXT,
          quantity REAL NOT NULL,
          expiryDate TEXT NOT NULL,
          minThreshold REAL DEFAULT 1,
          calories REAL,
          proteins REAL,
          carbs REAL,
          fats REAL,
          unit TEXT DEFAULT 'g'
        );
      `;
            await this.db.execute(schema);
            this.isDbReady = true;
            console.log("Database SQLite locale inizializzato con successo.");
        } catch (error) {
            console.error("Errore durante l\'inizializzazione di SQLite:", error);
        }
    }

    //Metodi CRUD di base per la dispensa
    async getPantryItems() {
        if (!this.isDbReady) await this.initDatabase();

        const res = await this.db.query('SELECT * FROM PantryItem ORDER BY expiryDate ASC;');
        return res.values ?? [];
    }

    async addPantryItem(item: {
        id: string;
        productId: string;
        name: string;
        brand?: string;
        quantity: number;
        expiryDate: string;
        minThreshold?: number;
        calories: number;
        proteins: number;
        carbs: number;
        fats: number;
        unit?: string;
    }) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `
      INSERT INTO PantryItem (id, productId, name, brand, quantity, expiryDate, minThreshold, calories, proteins, carbs, fats, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
        const values = [
            item.id,
            item.productId,
            item.name,
            item.brand || null,
            item.quantity,
            item.expiryDate,
            item.minThreshold ?? 1,
            item.calories,
            item.proteins,
            item.carbs,
            item.fats,
            item.unit ?? 'g',
        ];
        return await this.db.run(query, values);
    }

    async updateQuantity(id: string, quantity: string) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `UPDATE PantryItem SET quantity=? WHERE id=?`;
        return await this.db.run(query, [quantity, id]);
    }
    async removeItem(id: string) {
        if (!this.isDbReady) await this.initDatabase();
        const query = `DELETE FROM PantryItem WHERE id=?`;
        return await this.db.run(query, [id]);
    }
}
