import { Player, isSamePlayer } from './types/player';
import {
  Point,
  PointsData,
  Score,
  advantage,
  game,
  deuce,
  FortyData,
  fifteen,
  thirty,
  forty,
} from './types/score';
import { none, Option, some, match as matchOpt } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};
// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return 'Love';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS':
      return `${pointToString(score.pointsData.PLAYER_ONE)} - ${pointToString(
        score.pointsData.PLAYER_TWO
      )}`;
    case 'FORTY':
      return `40 - ${pointToString(score.fortyData.otherPoint)}`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      return `Advantage ${playerToString(score.player)}`;
    case 'GAME':
      return `Game ${playerToString(score.player)}`;
  }
};

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce(),
      p => forty(currentForty.player, p) as Score
    )
  );
};

export const scoreWhenGame = (winner: Player): Score => game(winner);

export const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return some(fifteen());
    case 'FIFTEEN':
      return some(thirty());
    case 'THIRTY':
      return none;
  }
};

// Exercice 2
// Tip: You can use pipe function from fp-ts to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  switch (winner) {
    case 'PLAYER_ONE':
      switch (current.PLAYER_ONE.kind) {
        case 'THIRTY':
          // When winner has 30, transition to FORTY
          return {
            kind: 'FORTY',
            fortyData: {
              player: 'PLAYER_ONE',
              otherPoint: current.PLAYER_TWO,
            },
          };
        case 'LOVE':
        case 'FIFTEEN':
          // For lower points, increment winner's points
          return {
            kind: 'POINTS',
            pointsData: {
              PLAYER_ONE: pipe(
                incrementPoint(current.PLAYER_ONE),
                matchOpt(
                  () => current.PLAYER_ONE,
                  p => p
                )
              ),
              PLAYER_TWO: current.PLAYER_TWO,
            },
          };
      }
    case 'PLAYER_TWO':
      switch (current.PLAYER_TWO.kind) {
        case 'THIRTY':
          // When winner has 30, transition to FORTY
          return {
            kind: 'FORTY',
            fortyData: {
              player: 'PLAYER_TWO',
              otherPoint: current.PLAYER_ONE,
            },
          };
        case 'LOVE':
        case 'FIFTEEN':
          // For lower points, increment winner's points
          return {
            kind: 'POINTS',
            pointsData: {
              PLAYER_ONE: current.PLAYER_ONE,
              PLAYER_TWO: pipe(
                incrementPoint(current.PLAYER_TWO),
                matchOpt(
                  () => current.PLAYER_TWO,
                  p => p
                )
              ),
            },
          };
      }
  }
};

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'GAME':
      return scoreWhenGame(winner);
  }
};
