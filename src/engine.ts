import { FastifyInstance } from 'fastify';
import { games, players, rolls, turns } from './db/schemas/index.js';
import { eq } from 'drizzle-orm';

// constants
const avatars: Array<'dog' | 'hat' | 'iron' | 'racecar' | 'ship' | 'shoe' | 'thimble' | 'wheelbarrow'> = [
  'dog',
  'hat',
  'iron',
  'racecar',
  'ship',
  'shoe',
  'thimble',
  'wheelbarrow',
];
const railroadRentBaseRent = 25;
const utilityRentModifiers = { 1: 4, 2: 10 };

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

    await app.db.update(players).set({ avatar: avatar, currentTileId: 'GO', order }).where(eq(players.id, player.id));

    avatarsCopy.splice(randomIndex, 1);
    order++;
  }

  // create first turn
  const firstPlayer = game.players.find((player) => player.order === 0)!;
  await app.db.insert(turns).values({ gameId: game.id, phase: 'pending', playerId: firstPlayer.id, round: 1 });
}

export async function playerMove(id: string, app: FastifyInstance) {
  const player = await app.db.query.players.findFirst({
    where: (players, { eq }) => eq(players.id, id),
    with: {
      game: {
        with: {
          players: true,
        },
      },
      turns: {
        with: {
          rolls: true,
        },
      },
    },
  });

  if (!player) {
    throw new Error('Player not found');
  }

  // Game is not currently happening
  if (player.game.state !== 'ongoing') {
    throw new Error('Game is not ongoing');
  }

  // if there is no turn yet or all turns are currently complete don't allow the player to move
  if (!player.turns.length || player.turns.every((turn) => turn.phase === 'complete')) {
    throw new Error("Not this player's turn yet");
  }

  // if player is in jail, don't let them move
  if (player.isInJail) {
    throw new Error('Player is in jail');
  }

  // cache game
  const game = player.game;

  // cache other players and the next player
  const otherPlayers = player.game.players.filter((p) => p.id !== player.id);
  const goBackToTopOfPlayerOrder = player.order === player.game.players.length - 1;
  const nextInOrder = goBackToTopOfPlayerOrder ? 0 : player.order + 1;
  const nextPlayer = otherPlayers.find((p) => p.order === nextInOrder);
  if (!nextPlayer) {
    throw new Error('Next player not found');
  }

  // NOTE: there is at least one turn incomplete at this point
  // TODO: is there a better way to filter this or not have to use the ! operator?
  const turn = player.turns.find((turn) => turn.phase !== 'complete')!;

  // get all tiles
  const tiles = await app.db.query.tiles.findMany();

  await app.db.transaction(async (tx) => {
    // roll dice
    const die1 = rollDice();
    const die2 = rollDice();
    const isEqual = die1 === die2;
    const total = die1 + die2;

    const newRoll = await tx
      .insert(rolls)
      .values({ die1, die2, gameId: player.gameId, kind: 'movement', playerId: player.id, total, turnId: turn.id });

    // get other movement rolls for this turn
    const otherMovementRolls = turn.rolls.filter((roll) => roll.kind === 'movement');

    // determine if player is sent jail
    if (isEqual && otherMovementRolls.length === 2 && otherMovementRolls.every((roll) => roll.die1 === roll.die2)) {
      // if there were two other movement rolls this turn and they were also doubles, send to jail
      // send to jail
      await tx.update(players).set({ currentTileId: 'JAIL', isInJail: true }).where(eq(players.id, player.id));

      // set ended tile to jail and complete turn
      await tx
        .update(turns)
        .set({ phase: 'complete', endTileId: 'JAIL', isFinished: true })
        .where(eq(turns.id, turn.id));

      // should increment game round
      if (goBackToTopOfPlayerOrder) {
        const afterUpdatingGameRound = await tx
          .update(games)
          .set({ round: player.game.round + 1 })
          .where(eq(games.id, player.gameId))
          .returning({ round: games.round });

        game.round = afterUpdatingGameRound[0].round;
      }

      // create next player's turn
      await tx.insert(turns).values({
        gameId: player.gameId,
        phase: 'pending',
        playerId: nextPlayer.id,
        round: game.round,
        startTileId: nextPlayer.currentTileId,
      });

      return;
    }

    if (!player.currentTileId) {
      throw new Error("Player does not have a current tile, which shouldn't happen");
    }
    const { endingTileId, passedGo } = determineNextTile(player.currentTileId, total, tiles);

    const endingTile = tiles.find((tile) => tile.id === endingTileId);
    if (!endingTile) {
      throw new Error(`Ending tile: [${endingTileId}] not found`);
    }

    // update player's current tile along with money if passed go AND turn end tile (even if turn is not over)
    const afterMovementPlayerUpdates = await tx
      .update(players)
      .set({ currentTileId: endingTileId, money: passedGo ? player.money + 200 : player.money })
      .where(eq(players.id, player.id))
      .returning({ currentTileId: players.currentTileId, money: players.money });

    // keep cached model up to date
    player.currentTileId = afterMovementPlayerUpdates[0].currentTileId;
    player.money = afterMovementPlayerUpdates[0].money;

    // is ending space go to jail?
    if (endingTile.id === 'GO_TO_JAIL') {
      // send to jail
      await tx.update(players).set({ currentTileId: 'JAIL', isInJail: true }).where(eq(players.id, player.id));

      // set ended tile to jail and complete turn
      await tx
        .update(turns)
        .set({ phase: 'complete', endTileId: 'JAIL', isFinished: true })
        .where(eq(turns.id, turn.id));

      // should increment game round
      if (goBackToTopOfPlayerOrder) {
        const afterUpdatingGameRound = await tx
          .update(games)
          .set({ round: player.game.round + 1 })
          .where(eq(games.id, player.gameId))
          .returning({ round: games.round });

        game.round = afterUpdatingGameRound[0].round;
      }

      // create next player's turn
      await tx.insert(turns).values({
        gameId: player.gameId,
        phase: 'pending',
        playerId: nextPlayer.id,
        round: game.round,
        startTileId: nextPlayer.currentTileId,
      });

      return;
    }

    // determine if property_aquisition is needed and set turn end tile
    const isProperty = endingTile.type === 'property';
    const isRailroad = endingTile.type === 'railroad';
    const isUtility = endingTile.type === 'utility';

    if (isProperty || isRailroad || isUtility) {
      // determine if property is owned
      const maybeDeed = await tx.query.deeds.findFirst({
        where: (deeds, { and, eq }) => and(eq(deeds.gameId, player.gameId), eq(deeds.tileId, endingTileId)),
      });

      // if property is owned and not by the active player, determine rent
      if (maybeDeed && maybeDeed.ownerId !== player.id) {
        // TODO: determine rent and pay
      } else {
        // enter property acquisition phase
        await tx
          .update(turns)
          .set({ endTileId: endingTileId, phase: 'property_acquisition' })
          .where(eq(turns.id, turn.id));
      }
    } else if (endingTile.type === 'tax') {
      const taxAmount = endingTile.id === 'INCOME_TAX' ? 200 : 100;
      await tx
        .update(players)
        .set({ money: player.money - taxAmount })
        .where(eq(players.id, player.id));

      // set turn state
      const isFinished = !isEqual;
      const nextPhase = isFinished ? 'complete' : 'pending';
      await tx
        .update(turns)
        .set({ endTileId: endingTileId, isFinished, phase: nextPhase })
        .where(eq(turns.id, turn.id));

      if (isFinished) {
        // should increment game round
        if (goBackToTopOfPlayerOrder) {
          const afterUpdatingGameRound = await tx
            .update(games)
            .set({ round: player.game.round + 1 })
            .where(eq(games.id, player.gameId))
            .returning({ round: games.round });

          game.round = afterUpdatingGameRound[0].round;
        }

        // create next player's turn
        await tx.insert(turns).values({
          gameId: player.gameId,
          phase: 'pending',
          playerId: nextPlayer.id,
          round: game.round,
          startTileId: nextPlayer.currentTileId,
        });
      }
    } else {
      // just special tiles remain, except for go to jail which is handled above
      if (endingTile.id.startsWith('COMMUNITY_CHEST')) {
        // TODO
      } else if (endingTile.id.startsWith('CHANCE')) {
        // TODO
      } else {
        // no other effects need to be handled
        // set turn state
        const isFinished = !isEqual;
        const nextPhase = isFinished ? 'complete' : 'pending';
        await tx
          .update(turns)
          .set({ endTileId: endingTileId, isFinished, phase: nextPhase })
          .where(eq(turns.id, turn.id));

        if (isFinished) {
          // should increment game round
          if (goBackToTopOfPlayerOrder) {
            const afterUpdatingGameRound = await tx
              .update(games)
              .set({ round: player.game.round + 1 })
              .where(eq(games.id, player.gameId))
              .returning({ round: games.round });

            game.round = afterUpdatingGameRound[0].round;
          }

          // create next player's turn
          await tx.insert(turns).values({
            gameId: player.gameId,
            phase: 'pending',
            playerId: nextPlayer.id,
            round: game.round,
            startTileId: nextPlayer.currentTileId,
          });
        }
      }
    }
  });
}

function calculateRailroadRent(numberOfRailroads: number) {
  if (numberOfRailroads < 1 || numberOfRailroads > 4) {
    throw new Error('Invalid number of railroads');
  }

  return railroadRentBaseRent * Math.pow(2, numberOfRailroads - 1);
}

function calculateUtilityRent(numberOfUtilities: 1 | 2, totalRoll: number) {
  if (numberOfUtilities < 1 || numberOfUtilities > 2) {
    throw new Error('Invalid number of utilities');
  }

  return totalRoll * utilityRentModifiers[numberOfUtilities];
}

function determineNextTile(currentTileId: string, movement: number, tiles: Array<{ id: string; order: number }>) {
  const totalTiles = tiles.length;
  const currentTile = tiles.find((tile) => tile.id === currentTileId);

  if (!currentTile) {
    throw new Error(`Current tile: [${currentTileId}] not found`);
  }

  const currentOrderOffset = currentTile.order + movement;
  const passedGo = currentOrderOffset >= totalTiles;
  const normalizedOrder = currentOrderOffset % totalTiles;
  const endingTile = tiles.find((tile) => tile.order === normalizedOrder);

  if (!endingTile) {
    throw new Error(`Ending tile at order: [${normalizedOrder}] not found`);
  }

  return { endingTileId: endingTile.id, passedGo };
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// purchase tile
