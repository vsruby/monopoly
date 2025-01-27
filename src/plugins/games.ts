import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { games, players } from '../db/schemas/index.js';

const createGameSchema = {
  type: 'object',
  properties: {
    hostId: { type: 'string', format: 'uuid' },
  },
  required: ['hostId'],
} as const;
type CreateGameBody = FromSchema<typeof createGameSchema>;

export const gamesPlugin: FastifyPluginAsync = async (app) => {
  app.get('/games', async (_req, res) => {
    const games = await app.db.query.games.findMany();

    return res.status(200).send({ games });
  });

  app.post<{ Body: CreateGameBody }>('/games', { schema: { body: createGameSchema } }, async (req, res) => {
    const { hostId } = req.body;

    const response = await app.db.insert(games).values({ hostId }).returning({
      id: games.id,
      hostId: games.hostId,
      createdAt: games.createdAt,
      updatedAt: games.updatedAt,
    });
    const game = response[0];

    // NOTE: this is assuming that the host will also be one of the players
    await app.db.insert(players).values({ gameId: game.id, userId: hostId }).returning({
      id: players.id,
      gameId: players.gameId,
      userId: players.userId,
      money: players.money,
      createdAt: players.createdAt,
      updatedAt: players.updatedAt,
    });

    return res.status(201).send({ game });
  });
};
