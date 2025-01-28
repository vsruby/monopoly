import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { games, players } from '../db/schemas/index.js';
import { InferSelectModel } from 'drizzle-orm';
import * as engine from '../engine.js';

const createGameBodySchema = {
  type: 'object',
  properties: {
    hostId: { type: 'string', format: 'uuid' },
  },
  required: ['hostId'],
} as const;
type CreateGameBody = FromSchema<typeof createGameBodySchema>;

const showGameParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;
type ShowGameParam = FromSchema<typeof showGameParamSchema>;

export const gamesPlugin: FastifyPluginAsync = async (app) => {
  // INDEX ROUTE
  app.get('/games', async (_req, res) => {
    const games = await app.db.query.games.findMany();

    return res.status(200).send({ games: games.map(transform) });
  });

  // SHOW ROUTE
  app.get<{ Params: ShowGameParam }>('/games/:id', { schema: { params: showGameParamSchema } }, async (req, res) => {
    const { id } = req.params;

    const game = await app.db.query.games.findFirst({
      where: (games, { eq }) => eq(games.id, id),
    });

    if (!game) {
      return res.status(404).send({ error: 'Game not found' });
    }

    return res.status(200).send({ game: transform(game) });
  });

  // STORE ROUTE
  app.post<{ Body: CreateGameBody }>('/games', { schema: { body: createGameBodySchema } }, async (req, res) => {
    const { hostId } = req.body;

    const response = await app.db.insert(games).values({ hostId }).returning({
      id: games.id,
      hostId: games.hostId,
      round: games.round,
      state: games.state,
      createdAt: games.createdAt,
      updatedAt: games.updatedAt,
    });
    const game = response[0];

    // NOTE: this is assuming that the host will also be one of the players
    await app.db.insert(players).values({ gameId: game.id, userId: hostId }).execute();

    return res.status(201).send({ game: transform(game) });
  });

  // START ROUTE
  // NOTE: this is using the same params as the show route but may need to have it's own in the future
  app.post<{ Params: ShowGameParam }>(
    '/games/:id/start',
    { schema: { params: showGameParamSchema } },
    async (req, res) => {
      const { id } = req.params;

      const game = await app.db.query.games.findFirst({
        where: (games, { eq }) => eq(games.id, id),
      });

      // TODO: add more validations. ex. like if the game has enough players, or if the game is already started
      if (!game) {
        return res.status(404).send({ error: 'Game not found' });
      }

      engine.startGame(id, app);

      return res.status(200).send({ game: transform(game) });
    }
  );
};

type Game = InferSelectModel<typeof games>;
function transform(game: Game) {
  return {
    id: game.id,
    hostId: game.hostId,
    round: game.round,
    state: game.state,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}
