import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import * as engine from '../engine.js';
import { transformGame, transformPlayer, transformTurn } from '../utils/transforms.js';

const startGameParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;
type StartGameParam = FromSchema<typeof startGameParamSchema>;

export const actionsPlugin: FastifyPluginAsync = async (app) => {
  // MOVE
  app.post<{ Params: StartGameParam }>(
    '/player-move/:id',
    { schema: { params: startGameParamSchema } },
    async (req, res) => {
      const { id } = req.params;

      try {
        await engine.playerMove(id, app);
      } catch (error) {
        app.log.error(error, 'Error moving player');

        if (error instanceof Error) {
          if (error.message === 'Player not found') {
            return res.status(404).send({ error: error.message });
          }
          if (error.message === 'Game is not ongoing') {
            return res.status(400).send({ error: error.message });
          }
          if (error.message === "Not this player's turn yet") {
            return res.status(400).send({ error: error.message });
          }
          if (error.message === 'Player is in jail') {
            return res.status(400).send({ error: error.message });
          }
        }

        return res.status(500).send({ error: 'Internal server error' });
      }

      const player = await app.db.query.players.findFirst({
        where: (players, { eq }) => eq(players.id, id),
        with: {
          game: true,
          turns: true,
        },
      });

      return res.status(200).send({
        player: {
          ...transformPlayer(player!),
          game: transformGame(player!.game),
          turns: player!.turns.map(transformTurn),
        },
      });
    }
  );

  // START GAME
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

      await engine.startGame(id, app);

      return res.status(200).send({ game: transformGame(game) });
    }
  );
};
