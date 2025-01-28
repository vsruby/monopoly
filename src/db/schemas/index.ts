import { sql, relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// -- GAME SCHEMA
export const games = pgTable(
  'games',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id),
    state: varchar('state', { enum: ['complete', 'pending', 'ongoing'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.hostId)]
);
export const gameRelations = relations(games, ({ many, one }) => ({
  host: one(users, { fields: [games.id], references: [users.id] }),
  players: many(players),
  turns: many(turns),
}));

// -- PLAYER SCHEMA
export const players = pgTable(
  'players',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    avatar: varchar('avatar', {
      enum: ['dog', 'hat', 'iron', 'racecar', 'ship', 'shoe', 'thimble', 'wheelbarrow'],
    }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    money: integer('money').notNull().default(1500),
    order: integer('order').notNull().default(0),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.gameId), index().on(t.userId), uniqueIndex().on(t.gameId, t.userId)]
);
export const playerRelations = relations(players, ({ many, one }) => ({
  game: one(games, { fields: [players.gameId], references: [games.id] }),
  user: one(users, { fields: [players.userId], references: [users.id] }),
}));

// -- TILE GROUP SCHEMA
export const tileGroups = pgTable(
  'tile_groups',
  {
    id: varchar().primaryKey(),
    name: varchar('name').notNull(),
    type: varchar('type', { enum: ['property', 'railroad', 'utility'] }).notNull(),
    // just lookup table, doesn't need timestamps
  },
  (t) => [index().on(t.type)]
);
export const tileGroupRelations = relations(tileGroups, ({ many }) => ({
  tiles: many(tiles),
}));

// -- TILE SCHEMA
export const tiles = pgTable(
  'tiles',
  {
    id: varchar().primaryKey(),
    groupId: varchar('group_id').references(() => tileGroups.id),
    name: varchar('name').notNull(),
    order: integer('order').notNull(),
    price: integer('price'),
    type: varchar('type', { enum: ['property', 'railroad', 'special', 'tax', 'utility'] }).notNull(),
    // just lookup table, doesn't need timestamps
  },
  (t) => [index().on(t.type), index().on(t.order)]
);
export const tileRelations = relations(tiles, ({ one }) => ({
  group: one(tileGroups, { fields: [tiles.groupId], references: [tileGroups.id] }),
}));

// -- TURN SCHEMA
export const turns = pgTable('turns', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id),
  isFinished: boolean('is_finished').notNull().default(false),
  phase: varchar('phase').notNull(),
  playerId: uuid('player_id')
    .notNull()
    .references(() => players.id),
  round: integer('round').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});
export const turnRelations = relations(turns, ({ one }) => ({
  game: one(games, { fields: [turns.gameId], references: [games.id] }),
  player: one(players, { fields: [turns.playerId], references: [players.id] }),
}));

// -- USER SCHEMA
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email').notNull(),
    fullName: varchar('full_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex().on(t.email)]
);
export const userRelations = relations(users, ({ many }) => ({
  games: many(games),
  players: many(players),
  turns: many(turns),
}));
