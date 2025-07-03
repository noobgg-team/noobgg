import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Context } from 'hono';

// Helper function for query builder mock
function createQueryBuilderMock() {
  return {
    from: mock().mockReturnThis(),
    where: mock().mockReturnThis(),
    returning: mock(),
    limit: mock(),
    innerJoin: mock().mockReturnThis(),
    values: mock().mockReturnThis(),
  };
}

// Mock the db module BEFORE importing anything that depends on it
mock.module('../../db', () => ({
  db: {
    select: mock().mockReturnValue(createQueryBuilderMock()),
    insert: mock().mockReturnValue(createQueryBuilderMock()),
    update: mock().mockReturnValue(createQueryBuilderMock()),
    delete: mock().mockReturnValue(createQueryBuilderMock()),
    transaction: mock(),
  }
}));

// Import AFTER mocking
import { db } from '../../db';
import {
  addFavoriteGame,
  removeFavoriteGame,
  getFavoriteGames,
} from './user-favorite-games.controller';

// Mock Hono's context
const mockJson = mock();
const mockReqJson = mock();
const mockBody = mock();

const mockContext = (body?: Record<string, unknown>, params?: Record<string, string>) => ({
  req: {
    json: mockReqJson.mockResolvedValue(body || {}),
    param: (key: string) => params?.[key]
  },
  json: mockJson,
  body: mockBody,
}) as unknown as Context;

describe('UserFavoriteGames Controller', () => {
  beforeEach(() => {
    mockJson.mockClear();
    mockReqJson.mockClear();
    mockBody.mockClear();

    // Reset db spies to prevent cross-test bleed
    (db.select as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.insert as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.update as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.delete as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.transaction as any).mockReset();
  });

  describe('addFavoriteGame', () => {
    const validRequestBody = { gameId: '2' };
    
    it('should add favorite game successfully', async () => {
      const createdFavorite = {
        id: BigInt(1),
        userProfileId: BigInt(1),
        gameId: BigInt(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock successful transaction
      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock()
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([{ id: BigInt(1) }]) // User exists
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([{ id: BigInt(2) }]) // Game exists
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([]) // No existing favorite
              })
            }),
          insert: mock().mockReturnValue({
            values: mock().mockReturnValue({
              returning: mock().mockResolvedValue([createdFavorite])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validRequestBody, { userId: '1' });
      await addFavoriteGame(c);

      expect(db.transaction).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        userProfileId: '1',
        gameId: '2',
      }), 201);
    });

    it('should return 400 for invalid user ID', async () => {
      const c = mockContext(validRequestBody, { userId: 'invalid' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for missing user ID', async () => {
      const c = mockContext(validRequestBody, {});
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for invalid game ID in body', async () => {
      const invalidBody = { gameId: 'invalid' };
      const c = mockContext(invalidBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toContain('gameId');
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for missing game ID in body', async () => {
      const invalidBody = {};
      const c = mockContext(invalidBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toContain('gameId');
        expect(error.status).toBe(400);
      }
    });

    it('should return 404 when user not found', async () => {
      // Mock transaction that finds no user
      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([]) // No user found
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validRequestBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("User not found");
        expect(error.status).toBe(404);
      }
    });

    it('should return 404 when game not found', async () => {
      // Mock transaction: user exists, game doesn't
      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock()
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([{ id: BigInt(1) }]) // User exists
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([]) // Game doesn't exist
              })
            })
        };
        return await callback(txMock);
      });

      const c = mockContext(validRequestBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Game not found");
        expect(error.status).toBe(404);
      }
    });

    it('should return 409 when favorite already exists', async () => {
      const existingFavorite = {
        id: BigInt(1),
        userProfileId: BigInt(1),
        gameId: BigInt(2),
      };

      // Mock transaction: user exists, game exists, favorite exists
      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock()
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([{ id: BigInt(1) }]) // User exists
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([{ id: BigInt(2) }]) // Game exists
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([existingFavorite]) // Favorite exists
              })
            })
        };
        return await callback(txMock);
      });

      const c = mockContext(validRequestBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Game is already in favorites");
        expect(error.status).toBe(409);
      }
    });

    it('should return 500 on database error', async () => {
      (db.transaction as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const c = mockContext(validRequestBody, { userId: '1' });
      
      try {
        await addFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Internal server error");
        expect(error.status).toBe(500);
      }
    });
  });

  describe('removeFavoriteGame', () => {
    it('should remove favorite game successfully', async () => {
      const deletedFavorite = {
        id: BigInt(1),
        userProfileId: BigInt(1),
        gameId: BigInt(2),
      };

      const returningMock = mock().mockResolvedValue([deletedFavorite]);
      const whereMock = mock().mockReturnValue({ returning: returningMock });
      (db.delete as any).mockReturnValue({ where: whereMock });

      const c = mockContext({}, { userId: '1', gameId: '2' });
      await removeFavoriteGame(c);

      expect(db.delete).toHaveBeenCalled();
      expect(whereMock).toHaveBeenCalled();
      expect(returningMock).toHaveBeenCalled();
      expect(mockBody).toHaveBeenCalledWith(null, 204);
    });

    it('should return 400 for invalid user ID', async () => {
      const c = mockContext({}, { userId: 'invalid', gameId: '2' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for invalid game ID', async () => {
      const c = mockContext({}, { userId: '1', gameId: 'invalid' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid game ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for missing user ID', async () => {
      const c = mockContext({}, { gameId: '2' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for missing game ID', async () => {
      const c = mockContext({}, { userId: '1' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid game ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 404 when favorite not found', async () => {
      const returningMock = mock().mockResolvedValue([]);
      const whereMock = mock().mockReturnValue({ returning: returningMock });
      (db.delete as any).mockReturnValue({ where: whereMock });

      const c = mockContext({}, { userId: '1', gameId: '2' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Favorite not found");
        expect(error.status).toBe(404);
      }
    });

    it('should return 500 on database error', async () => {
      (db.delete as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const c = mockContext({}, { userId: '1', gameId: '2' });
      
      try {
        await removeFavoriteGame(c);
      } catch (error: any) {
        expect(error.message).toBe("Internal server error");
        expect(error.status).toBe(500);
      }
    });
  });

  describe('getFavoriteGames', () => {
    it('should get favorite games successfully', async () => {
      const mockFavorites = [
        {
          id: BigInt(1),
          gameId: BigInt(2),
          gameName: 'Counter-Strike 2',
          createdAt: new Date(),
        },
        {
          id: BigInt(2),
          gameId: BigInt(3),
          gameName: 'Valorant',
          createdAt: new Date(),
        },
      ];

      // Mock user exists check
      const userExistsWhereMock = mock().mockResolvedValue([{ id: BigInt(1) }]);
      const userExistsFromMock = mock().mockReturnValue({ where: userExistsWhereMock });
      
      // Mock favorite games query
      const favoritesWhereMock = mock().mockResolvedValue(mockFavorites);
      const favoritesInnerJoinMock = mock().mockReturnValue({ where: favoritesWhereMock });
      const favoritesFromMock = mock().mockReturnValue({ innerJoin: favoritesInnerJoinMock });
      
      (db.select as any)
        .mockReturnValueOnce({ from: userExistsFromMock }) // User exists check
        .mockReturnValueOnce({ from: favoritesFromMock }); // Favorites query

      const c = mockContext({}, { userId: '1' });
      await getFavoriteGames(c);

      expect(db.select).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith([
        expect.objectContaining({
          id: '1',
          gameId: '2',
          gameName: 'Counter-Strike 2',
        }),
        expect.objectContaining({
          id: '2',
          gameId: '3',
          gameName: 'Valorant',
        }),
      ]);
    });

    it('should return 400 for invalid user ID', async () => {
      const c = mockContext({}, { userId: 'invalid' });
      
      try {
        await getFavoriteGames(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 400 for missing user ID', async () => {
      const c = mockContext({}, {});
      
      try {
        await getFavoriteGames(c);
      } catch (error: any) {
        expect(error.message).toBe("Invalid user ID");
        expect(error.status).toBe(400);
      }
    });

    it('should return 404 when user not found', async () => {
      const whereMock = mock().mockResolvedValue([]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const c = mockContext({}, { userId: '1' });
      
      try {
        await getFavoriteGames(c);
      } catch (error: any) {
        expect(error.message).toBe("User not found");
        expect(error.status).toBe(404);
      }
    });

    it('should return empty array when user has no favorites', async () => {
      // Mock user exists check
      const userExistsWhereMock = mock().mockResolvedValue([{ id: BigInt(1) }]);
      const userExistsFromMock = mock().mockReturnValue({ where: userExistsWhereMock });
      
      // Mock empty favorites query
      const favoritesWhereMock = mock().mockResolvedValue([]);
      const favoritesInnerJoinMock = mock().mockReturnValue({ where: favoritesWhereMock });
      const favoritesFromMock = mock().mockReturnValue({ innerJoin: favoritesInnerJoinMock });
      
      (db.select as any)
        .mockReturnValueOnce({ from: userExistsFromMock }) // User exists check
        .mockReturnValueOnce({ from: favoritesFromMock }); // Empty favorites query

      const c = mockContext({}, { userId: '1' });
      await getFavoriteGames(c);

      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      (db.select as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const c = mockContext({}, { userId: '1' });
      
      try {
        await getFavoriteGames(c);
      } catch (error: any) {
        expect(error.message).toBe("Internal server error");
        expect(error.status).toBe(500);
      }
    });
  });
});