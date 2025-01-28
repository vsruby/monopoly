import { InferSelectModel } from 'drizzle-orm';
import { games } from '../db/schemas/index.js';

type Game = InferSelectModel<typeof games>;
export function transformGame(game: Game) {
  return {
    id: game.id,
    hostId: game.hostId,
    round: game.round,
    state: game.state,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}
