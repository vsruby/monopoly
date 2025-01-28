import { FastifyInstance } from 'fastify';
import { games, players, turns } from './db/schemas/index.js';
import { eq } from 'drizzle-orm';

export const avatars: Array<'dog' | 'hat' | 'iron' | 'racecar' | 'ship' | 'shoe' | 'thimble' | 'wheelbarrow'> = [
  'dog',
  'hat',
  'iron',
  'racecar',
  'ship',
  'shoe',
  'thimble',
  'wheelbarrow',
];

export async function startGame(id: string, app: FastifyInstance) {
  // set game to ongoing
  await app.db.update(games).set({ state: 'ongoing' }).where(eq(games.id, id));
  const gameResponse = await app.db.query.games.findFirst({
    where: (games, { eq }) => eq(games.id, id),
    with: {
      players: true,
    },
  });

  if (!gameResponse) {
    throw new Error('Game not found');
  }

  const game = gameResponse;

  // set player order and avatar
  let order = 0;
  const avatarsCopy = [...avatars];
  for (const player of game.players) {
    const randomIndex = Math.floor(Math.random() * avatarsCopy.length);
    const avatar = avatarsCopy[randomIndex];

    await app.db.update(players).set({ avatar: avatar, order }).where(eq(players.id, player.id));

    avatarsCopy.splice(randomIndex, 1);
    order++;
  }

  // create first turn
  const firstPlayer = game.players.find((player) => player.order === 0)!;
  await app.db.insert(turns).values({ gameId: game.id, phase: 'pending', playerId: firstPlayer.id, round: 1 });
}
