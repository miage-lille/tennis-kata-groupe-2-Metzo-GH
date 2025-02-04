import { describe, expect, test } from '@jest/globals';
import { isSamePlayer } from '../types/player';
import { advantage, game, deuce, newGame } from '../types/score';
import {
  otherPlayer,
  playerToString,
  scoreWhenDeuce,
  scoreWhenAdvantage,
  scoreWhenForty,
  scoreWhenPoint,
  score,
} from '..';
import * as fc from 'fast-check';

import * as G from './generators';

describe('Tests for tooling functions', () => {
  test('Given playerOne when playerToString', () => {
    expect(playerToString('PLAYER_ONE')).toStrictEqual('Player 1');
  });

  test('Given playerOne when otherPlayer', () => {
    expect(otherPlayer('PLAYER_ONE')).toStrictEqual('PLAYER_TWO');
  });
});

describe('Tests for transition functions', () => {
  test('Given deuce, score is advantage to winner', () => {
    fc.assert(
      fc.property(G.getPlayer(), winner => {
        const score = scoreWhenDeuce(winner);
        const scoreExpected = advantage(winner);
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given advantage when advantagedPlayer wins, score is Game avantagedPlayer', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer, winner) => {
        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const scoreExpected = game(winner);
        fc.pre(isSamePlayer(advantagedPlayer, winner));
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given advantage when otherPlayer wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getPlayer(), G.getPlayer(), (advantagedPlayer, winner) => {
        fc.pre(!isSamePlayer(advantagedPlayer, winner));
        const score = scoreWhenAdvantage(advantagedPlayer, winner);
        const scoreExpected = deuce();
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given a player at 40 when the same player wins, score is Game for this player', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        // Player who have forty points wins
        fc.pre(isSamePlayer(fortyData.player, winner));
        const score = scoreWhenForty(fortyData, winner);
        const scoreExpected = game(winner);
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
    fc.assert(
      fc.property(G.getForty(), G.getPlayer(), ({ fortyData }, winner) => {
        // Other player wins
        fc.pre(!isSamePlayer(fortyData.player, winner));
        // Other point must be 30
        fc.pre(fortyData.otherPoint.kind === 'THIRTY');
        const score = scoreWhenForty(fortyData, winner);
        const scoreExpected = deuce();
        expect(score).toStrictEqual(scoreExpected);
      })
    );
  });

  test('Given players at 0 or 15 points score kind is still POINTS', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        // Precondition: both players must have either 0 (LOVE) or 15 points
        fc.pre(
          (pointsData.PLAYER_ONE.kind === 'LOVE' ||
            pointsData.PLAYER_ONE.kind === 'FIFTEEN') &&
            (pointsData.PLAYER_TWO.kind === 'LOVE' ||
              pointsData.PLAYER_TWO.kind === 'FIFTEEN')
        );

        const newScore = scoreWhenPoint(pointsData, winner);

        // After scoring, we should still be in POINTS state
        expect(newScore.kind).toBe('POINTS');
      })
    );
  });

  test('Given one player at 30 and win, score is forty', () => {
    fc.assert(
      fc.property(G.getPoints(), G.getPlayer(), ({ pointsData }, winner) => {
        // Precondition: winning player must be at 30 points
        fc.pre(
          (winner === 'PLAYER_ONE' &&
            pointsData.PLAYER_ONE.kind === 'THIRTY') ||
            (winner === 'PLAYER_TWO' && pointsData.PLAYER_TWO.kind === 'THIRTY')
        );

        const newScore = scoreWhenPoint(pointsData, winner);

        // After winning at 30, score should be FORTY
        expect(newScore.kind).toBe('FORTY');
        if (newScore.kind === 'FORTY') {
          expect(newScore.fortyData.player).toBe(winner);
        }
      })
    );
  });

  test('Given new game when player wins at 30, score transitions to forty', () => {
    fc.assert(
      fc.property(G.getPlayer(), winner => {
        // Start with new game (both at love)
        let currentScore = newGame;

        // Win 3 points to get to 30
        for (let i = 0; i < 2; i++) {
          currentScore = score(currentScore, winner);
        }

        // Win one more point to go from 30 to forty
        const finalScore = score(currentScore, winner);

        // Verify we're at forty state
        expect(finalScore.kind).toBe('FORTY');
        if (finalScore.kind === 'FORTY') {
          expect(finalScore.fortyData.player).toBe(winner);
        }
      })
    );
  });
});
