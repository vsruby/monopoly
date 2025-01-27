import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { players } from '../db/schemas/index.js';

const createPlayerSchema = {
  type: 'object',
  properties: {
    gameId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
  },
  required: ['gameId', 'userId'],
} as const;
type CreatePlayerBody = FromSchema<typeof createPlayerSchema>;

export const playersPlugin: FastifyPluginAsync = async (app) => {
  app.get('/players', async (_req, res) => {
    const players = await app.db.query.players.findMany();

    return res.status(200).send({ players });
  });

  app.post<{ Body: CreatePlayerBody }>('/players', { schema: { body: createPlayerSchema } }, async (req, res) => {
    const { gameId, userId } = req.body;

    const response = await app.db.insert(players).values({ gameId, userId }).returning({
      id: players.id,
      gameId: players.gameId,
      money: players.money,
      userId: players.userId,
      createdAt: players.createdAt,
      updatedAt: players.updatedAt,
    });
    const player = response[0];

    return res.status(201).send({ player });
  });
};
