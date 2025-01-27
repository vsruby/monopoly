import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { players } from '../db/schemas/index.js';

const createPlayerBodySchema = {
  type: 'object',
  properties: {
    gameId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
  },
  required: ['gameId', 'userId'],
} as const;
type CreatePlayerBody = FromSchema<typeof createPlayerBodySchema>;

const showPlayerParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;
type ShowPlayerParam = FromSchema<typeof showPlayerParamSchema>;

export const playersPlugin: FastifyPluginAsync = async (app) => {
  app.get('/players', async (_req, res) => {
    const players = await app.db.query.players.findMany();

    return res.status(200).send({ players });
  });

  app.get<{ Params: ShowPlayerParam }>(
    '/players/:id',
    { schema: { params: showPlayerParamSchema } },
    async (req, res) => {
      const { id } = req.params;

      const player = await app.db.query.players.findFirst({
        where: (players, { eq }) => eq(players.id, id),
      });

      if (!player) {
        return res.status(404).send({ error: 'Player not found' });
      }

      return res.status(200).send({ player });
    }
  );

  app.post<{ Body: CreatePlayerBody }>('/players', { schema: { body: createPlayerBodySchema } }, async (req, res) => {
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
