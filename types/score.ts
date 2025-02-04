// État d'un joueur
type Player = 'PLAYER_ONE' | 'PLAYER_TWO';

// Points possibles dans un jeu
export type Point = Love | Fifteen | Thirty;

export type Love = {
  kind: 'LOVE';
};

export const love = (): Love => ({
  kind: 'LOVE',
});

export type Fifteen = {
  kind: 'FIFTEEN';
};

export const fifteen = (): Fifteen => ({
  kind: 'FIFTEEN',
});

export type Thirty = {
  kind: 'THIRTY';
};

export const thirty = (): Thirty => ({
  kind: 'THIRTY',
});

export type PointsData = {
  PLAYER_ONE: Point;
  PLAYER_TWO: Point;
};

export type Points = {
  kind: 'POINTS';
  pointsData: PointsData;
};

export const points = (
  playerOnePoints: Point,
  playerTwoPoints: Point
): Points => ({
  kind: 'POINTS',
  pointsData: {
    PLAYER_ONE: playerOnePoints,
    PLAYER_TWO: playerTwoPoints,
  },
});

// Exerice 0: Write all type constructors of Points, Deuce, Forty and Advantage types.

export type Deuce = {
  kind: 'DEUCE';
};

export const deuce = (): Deuce => ({
  kind: 'DEUCE',
});

export type FortyData = {
  player: Player; // le joueur qui a 40 points
  otherPoint: Point; // les points de l'autre joueur
};

export type Forty = {
  kind: 'FORTY';
  fortyData: FortyData;
};

export const forty = (player: Player, otherPoint: Point): Forty => ({
  kind: 'FORTY',
  fortyData: {
    player: player,
    otherPoint: otherPoint,
  },
});

export type Advantage = {
  kind: 'ADVANTAGE';
  player: Player; // le joueur qui a l'avantage
};

export const advantage = (player: Player): Advantage => ({
  kind: 'ADVANTAGE',
  player: player,
});

export type Game = {
  kind: 'GAME';
  player: Player; // Player has won
};

export const game = (winner: Player): Game => ({
  kind: 'GAME',
  player: winner,
});

export const newGame: Score = points(love(), love());

export type Score = Points | Forty | Deuce | Advantage | Game;
