import { InferSelectModel } from 'drizzle-orm';
import { games, players, turns } from '../db/schemas/index.js';

type Game = InferSelectModel<typeof games>;
type Player = InferSelectModel<typeof players>;
type Turn = InferSelectModel<typeof turns>;

function transformDate(date?: Date | null) {
  return date ? date.toISOString() : null;
}

export function transformGame(game: Game) {
  return {
    id: game.id,
    hostId: game.hostId,
    round: game.round,
    state: game.state,
    createdAt: transformDate(game.createdAt),
    updatedAt: transformDate(game.updatedAt),
  };
}

export function transformPlayer(player: Player) {
  return {
    id: player.id,
    avatar: player.avatar,
    currentTileId: player.currentTileId,
    money: player.money,
    order: player.order,
    createdAt: transformDate(player.createdAt),
    updatedAt: transformDate(player.updatedAt),
  };
}

export function transformTurn(turn: Turn) {
  return {
    id: turn.id,
    endTileId: turn.endTileId,
    isFinished: turn.isFinished,
    phase: turn.phase,
    round: turn.round,
    startTileId: turn.startTileId,
    createdAt: transformDate(turn.createdAt),
    updatedAt: transformDate(turn.updatedAt),
  };
}
