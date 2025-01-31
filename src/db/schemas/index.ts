import { sql, relations, min, max, is } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// -- CHANCE SCHEMA
export const chances = pgTable(
  'chances',
  {
    id: varchar().primaryKey(),
    description: text('description').notNull(),
    isGetOutOfJail: boolean('is_get_out_of_jail').notNull().default(false),
    name: varchar('name').notNull(),
  },
  (t) => [index().on(t.isGetOutOfJail)]
);
export const chanceRelations = relations(chances, ({ many }) => ({
  drawnChances: many(drawnChances),
}));

// -- COMMUNITY CHEST SCHEMA
export const communityChests = pgTable(
  'community_chests',
  {
    id: varchar().primaryKey(),
    description: text('description').notNull(),
    isGetOutOfJail: boolean('is_get_out_of_jail').notNull().default(false),
    name: varchar('name').notNull(),
  },
  (t) => [index().on(t.isGetOutOfJail)]
);
export const communityChestRelations = relations(communityChests, ({ many }) => ({
  drawnCommunityChests: many(drawnCommunityChests),
}));

// -- DRAWN CHANCE SCHEMA

export const drawnChances = pgTable(
  'drawn_chances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chanceId: varchar('chance_id')
      .notNull()
      .references(() => chances.id),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.chanceId), index().on(t.gameId)]
);
export const drawnChanceRelations = relations(drawnChances, ({ one }) => ({
  chance: one(chances, { fields: [drawnChances.chanceId], references: [chances.id] }),
  game: one(games, { fields: [drawnChances.gameId], references: [games.id] }),
}));

// -- DRAWN COMMUNITY CHEST SCHEMA
export const drawnCommunityChests = pgTable(
  'drawn_community_chests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    communityChestId: varchar('community_chest_id')
      .notNull()
      .references(() => communityChests.id),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.communityChestId), index().on(t.gameId)]
);
export const drawnCommunityChestRelations = relations(drawnCommunityChests, ({ one }) => ({
  communityChest: one(communityChests, {
    fields: [drawnCommunityChests.communityChestId],
    references: [communityChests.id],
  }),
  game: one(games, { fields: [drawnCommunityChests.gameId], references: [games.id] }),
}));

// -- DEED SCHEMA
export const deeds = pgTable(
  'deeds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    hasHotel: boolean('has_hotel').notNull().default(false),
    houseCount: integer('house_count').notNull().default(0),
    isMortgaged: boolean('is_mortgaged').notNull().default(false),
    ownerId: uuid('owner_id').references(() => players.id),
    tileId: varchar('tile_id')
      .notNull()
      .references(() => tiles.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.gameId), index().on(t.ownerId), index().on(t.tileId)]
);
export const deedRelations = relations(deeds, ({ one }) => ({
  game: one(games, { fields: [deeds.gameId], references: [games.id] }),
  owner: one(players, { fields: [deeds.ownerId], references: [players.id] }),
  tile: one(tiles, { fields: [deeds.tileId], references: [tiles.id] }),
}));

// -- GAME SCHEMA
export const games = pgTable(
  'games',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    hostId: uuid('host_id')
      .notNull()
      .references(() => users.id),
    isGetOutOfJailChanceCardUsed: boolean('is_get_out_of_jail_chance_card_used').notNull().default(false),
    isGetOutOfJailCommunityChestCardUsed: boolean('is_get_out_of_jail_community_chest_card_used')
      .notNull()
      .default(false),
    round: integer('round').notNull().default(1),
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
  deeds: many(deeds),
  drawnChances: many(drawnChances),
  drawnCommunityChests: many(drawnCommunityChests),
  host: one(users, { fields: [games.id], references: [users.id] }),
  players: many(players),
  rolls: many(rolls),
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
    currentTileId: varchar('current_tile_id').references(() => tiles.id),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    hasGetOutofJailChanceCard: boolean('has_get_out_of_jail_chance_card').notNull().default(false),
    hasGetOutofJailCommunityChestCard: boolean('has_get_out_of_jail_community_chest_card').notNull().default(false),
    isBankrupt: boolean('is_bankrupt').notNull().default(false),
    isInJail: boolean('is_in_jail').notNull().default(false),
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
  (t) => [
    index().on(t.gameId),
    index().on(t.hasGetOutofJailChanceCard),
    index().on(t.hasGetOutofJailCommunityChestCard),
    index().on(t.userId),
    uniqueIndex().on(t.gameId, t.userId),
  ]
);
export const playerRelations = relations(players, ({ many, one }) => ({
  deed: many(deeds),
  game: one(games, { fields: [players.gameId], references: [games.id] }),
  rolls: many(rolls),
  tile: one(tiles, { fields: [players.currentTileId], references: [tiles.id] }),
  turns: many(turns),
  user: one(users, { fields: [players.userId], references: [users.id] }),
}));

// -- ROLL SCHEMA
export const rolls = pgTable(
  'rolls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    die1: integer('die1').notNull(),
    die2: integer('die2').notNull(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id),
    kind: varchar('kind', { enum: ['get_out_of_jail', 'movement'] }).notNull(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    total: integer('total').notNull(),
    turnId: uuid('turn_id')
      .notNull()
      .references(() => turns.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [index().on(t.gameId), index().on(t.kind), index().on(t.playerId), index().on(t.turnId)]
);
export const rollRelations = relations(rolls, ({ one }) => ({
  game: one(games, { fields: [rolls.gameId], references: [games.id] }),
  player: one(players, { fields: [rolls.playerId], references: [players.id] }),
  turn: one(turns, { fields: [rolls.turnId], references: [turns.id] }),
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
  players: many(players),
  tiles: many(tiles),
}));

// -- TILE SCHEMA
export const tiles = pgTable(
  'tiles',
  {
    id: varchar().primaryKey(),
    groupId: varchar('group_id').references(() => tileGroups.id),
    hotelCost: integer('hotel_cost'),
    houseCost: integer('house_cost'),
    name: varchar('name').notNull(),
    order: integer('order').notNull(),
    price: integer('price'),
    rents: jsonb('rents').$type<{ base: number; fullSet: number; hotel: number; houses: number[] }>(),
    type: varchar('type', { enum: ['property', 'railroad', 'special', 'tax', 'utility'] }).notNull(),
    // just lookup table, doesn't need timestamps
  },
  (t) => [index().on(t.type), index().on(t.order)]
);
export const tileRelations = relations(tiles, ({ many, one }) => ({
  deeds: many(deeds),
  group: one(tileGroups, { fields: [tiles.groupId], references: [tileGroups.id] }),
}));

// -- TURN SCHEMA
export const turns = pgTable('turns', {
  id: uuid('id').defaultRandom().primaryKey(),
  endTileId: varchar('ended_on_tile_id').references(() => tiles.id),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id),
  isFinished: boolean('is_finished').notNull().default(false),
  phase: varchar('phase').notNull(),
  playerId: uuid('player_id')
    .notNull()
    .references(() => players.id),
  round: integer('round').notNull(),
  startTileId: varchar('started_on_tile_id').references(() => tiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});
export const turnRelations = relations(turns, ({ many, one }) => ({
  endTile: one(tiles, { fields: [turns.endTileId], references: [tiles.id] }),
  game: one(games, { fields: [turns.gameId], references: [games.id] }),
  player: one(players, { fields: [turns.playerId], references: [players.id] }),
  rolls: many(rolls),
  startTile: one(tiles, { fields: [turns.startTileId], references: [tiles.id] }),
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
}));
