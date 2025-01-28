import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
// import { games, players } from '../db/schemas/index.js';
// import { InferSelectModel } from 'drizzle-orm';
import * as engine from '../engine.js';
import { transformGame } from '../utils/transforms.js';

const startGameParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;
type StartGameParam = FromSchema<typeof startGameParamSchema>;

export const actionsPlugin: FastifyPluginAsync = async (app) => {
  // START ROUTE
  app.post<{ Params: StartGameParam }>(
    '/start-game/:id',
    { schema: { params: startGameParamSchema } },
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

      return res.status(200).send({ game: transformGame(game) });
    }
  );
};
