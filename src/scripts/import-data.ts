import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schemas/index.js';
import fs from 'fs/promises';

const dbUrl = 'postgresql://postgres:postgres@localhost:5432/postgres';
const queryClient = postgres(dbUrl);
const db = drizzle(queryClient, { schema });

async function importData() {
  await importTileGroups();
  await importTiles();
}

async function importTileGroups() {
  console.log('Importing tile groups...');

  await db.delete(schema.tileGroups);

  const rawTileGroups = await fs.readFile('./data/tile-groups.json', 'utf-8');
  const tileGroups: { id: string; name: string; type: 'property' | 'railroad' | 'utility' }[] =
    JSON.parse(rawTileGroups);

  for (const group of tileGroups) {
    await db.insert(schema.tileGroups).values({ ...group });
  }

  console.log('Finished importing tile groups');
}

async function importTiles() {
  console.log('Importing tiles...');

  await db.delete(schema.tiles);

  const rawTiles = await fs.readFile('./data/tiles.json', 'utf-8');
  const tiles: {
    id: string;
    name: string;
    order: number;
    price: number | null;
    type: 'property' | 'special' | 'tax' | 'railroad' | 'utility';
    group: string;
  }[] = JSON.parse(rawTiles);

  for (const tile of tiles) {
    await db.insert(schema.tiles).values({
      id: tile.id,
      name: tile.name,
      order: tile.order,
      price: tile.price,
      type: tile.type,
      groupId: tile.group,
    });
  }

  console.log('Finished importing tiles');
}

console.log('Importing data...');

await importData();

console.log('Finished importing data');

await queryClient.end();

console.log('Closed client');

// TODO: handle finsihed process better
