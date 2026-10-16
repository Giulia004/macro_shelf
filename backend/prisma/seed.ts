import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const categoriesToFetch = ['pasta', 'latte', 'riso', 'avena', 'petto di pollo', 'tonno', 'olio extravergine'];

async function fetchAndSeedFromOpenFoodFacts() {
    for (const term of categoriesToFetch) {
        try {
            const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&page_size=5&json=1`;

            const response = await fetch(url, {
                headers: { 'User-Agent': 'MacroShelfApp - Student Project' }
            });

            if (!response.ok) {
                console.warn(`⚠️ API ha risposto con status ${response.status} per la categoria "${term}"`);
                continue;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn(`⚠️ Risposta non JSON ricevuta per "${term}". Saltiamo.`);
                continue;
            }

            const data = await response.json();

            if (!data.products || data.products.length === 0) continue;

            for (const item of data.products) {
                if (!item.product_name || !item.nutriments) continue;

                const barcode = item.code || null;
                if (!barcode) continue;

                const name = item.product_name;
                const brand = item.brands || null;

                // Estrazione dell'URL dell'immagine da Open Food Facts
                const imageUrl = item.image_front_url || item.image_url || null;

                // Estrazione sicura dei macro per 100g
                const calories = item.nutriments['energy-kcal_100g'] || item.nutriments['energy-kcal'] || 0;
                const proteins = item.nutriments['proteins_100g'] || 0;
                const carbs = item.nutriments['carbohydrates_100g'] || 0;
                const fats = item.nutriments['fat_100g'] || 0;

                await prisma.product.upsert({
                    where: { barcode },
                    update: {
                        imageUrl // Aggiorna l'immagine se il prodotto esiste già
                    },
                    create: {
                        id: uuidv4(),
                        barcode,
                        name,
                        brand,
                        calories: Number(calories),
                        proteins: Number(proteins),
                        carbs: Number(carbs),
                        fats: Number(fats),
                        unit: 'g',
                        imageUrl, // Salvataggio della foto nel catalogo
                    },
                });
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`⚠️ Errore durante il fetch della categoria ${term}:`, error);
        }
    }
}

async function main() {
    await fetchAndSeedFromOpenFoodFacts();
}

main().catch((e) => {
    console.error('Errore critico nel seed:', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});