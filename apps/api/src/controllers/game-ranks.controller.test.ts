import { Request, Response } from 'express';
import { db } from '../db';
import { gameRanks } from '../db/schemas/game-ranks.drizzle';
import * as gameRankController from './game-ranks.controller';
import * as gameRankSchemas from '../schemas/gamerank.schema'; // To mock specific schemas if needed or their parse methods
import { z } from 'zod';

// Mock the db module
jest.mock('../db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  },
}));

// Mock Express Request and Response
const mockRequest = (body?: any, params?: any): Partial<Request> => ({
  body,
  params,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis(); // For 204 responses
  return res;
};

describe('GameRanks Controller', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Tests for createGameRank
  describe('createGameRank', () => {
    it('should create a game rank successfully with valid data', async () => {
      const req = mockRequest({
        name: 'Gold Nova',
        image: 'http://example.com/goldnova.png',
        order: 3,
        gameId: 1,
      }) as Request;
      const res = mockResponse() as Response;
      const mockCreatedGameRank = {
        id: 1,
        name: 'Gold Nova',
        image: 'http://example.com/goldnova.png',
        order: 3,
        gameId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([mockCreatedGameRank]),
      });

      await gameRankController.createGameRank(req, res);

      expect(db.insert).toHaveBeenCalledWith(gameRanks);
      expect(db.insert(gameRanks).values).toHaveBeenCalledWith({
        name: 'Gold Nova',
        image: 'http://example.com/goldnova.png',
        order: 3,
        gameId: 1,
      });
      expect(db.insert(gameRanks).returning).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedGameRank);
    });

    it('should return 400 for validation errors (e.g., missing name)', async () => {
      const req = mockRequest({
        // name is missing
        image: 'http://example.com/rank.png',
        order: 1,
        gameId: 1,
      }) as Request;
      const res = mockResponse() as Response;

      await gameRankController.createGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it('should return 500 if database insertion fails', async () => {
      const req = mockRequest({
        name: 'Silver Elite',
        image: 'http://example.com/silverelite.png',
        order: 2,
        gameId: 1,
      }) as Request;
      const res = mockResponse() as Response;

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });

      await gameRankController.createGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should return 500 if returning no rank from db', async () => {
      const req = mockRequest({
        name: 'Silver Elite',
        image: 'http://example.com/silverelite.png',
        order: 2,
        gameId: 1,
      }) as Request;
      const res = mockResponse() as Response;

      (db.insert as jest.Mock).mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([]), // Empty array
      });

      await gameRankController.createGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to create game rank',
      });
    });
  });

  // Tests for getAllGameRanks
  describe('getAllGameRanks', () => {
    it('should return all game ranks successfully', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const mockGameRanks = [
        { id: 1, name: 'Silver 1', image: 'img.png', order: 1, gameId: 1 },
        { id: 2, name: 'Gold Nova 1', image: 'img2.png', order: 2, gameId: 1 },
      ];

      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockResolvedValueOnce(mockGameRanks),
      });

      await gameRankController.getAllGameRanks(req, res);

      expect(db.select).toHaveBeenCalled();
      expect(db.select().from).toHaveBeenCalledWith(gameRanks);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGameRanks);
    });

    it('should return 500 if database selection fails', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });

      await gameRankController.getAllGameRanks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  // Tests for getGameRankById
  describe('getGameRankById', () => {
    it('should return a game rank successfully when found', async () => {
      const req = mockRequest(null, { id: '1' }) as Request;
      const res = mockResponse() as Response;
      const mockGameRank = { id: 1, name: 'Silver 1', image: 'img.png', order: 1, gameId: 1 };

      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([mockGameRank]),
      });

      await gameRankController.getGameRankById(req, res);

      expect(db.select().from(gameRanks).where).toHaveBeenCalled(); // More specific check for eq can be added if eq is mockable
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGameRank);
    });

    it('should return 400 for invalid ID format', async () => {
      const req = mockRequest(null, { id: 'abc' }) as Request; // Invalid ID
      const res = mockResponse() as Response;

      await gameRankController.getGameRankById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it('should return 404 when game rank is not found', async () => {
      const req = mockRequest(null, { id: '999' }) as Request;
      const res = mockResponse() as Response;

      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([]), // Empty array means not found
      });

      await gameRankController.getGameRankById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Game rank not found' });
    });

    it('should return 500 if database selection fails', async () => {
      const req = mockRequest(null, { id: '1' }) as Request;
      const res = mockResponse() as Response;

      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });

      await gameRankController.getGameRankById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  // Tests for updateGameRank
  describe('updateGameRank', () => {
    const updateData = { name: 'Updated Rank Name', order: 10 };
    const mockUpdatedRank = { id: 1, ...updateData, image: 'img.png', gameId: 1 };

    it('should update a game rank successfully with valid data', async () => {
      const req = mockRequest(updateData, { id: '1' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([mockUpdatedRank]),
      });

      await gameRankController.updateGameRank(req, res);

      expect(db.update).toHaveBeenCalledWith(gameRanks);
      expect(db.update(gameRanks).set).toHaveBeenCalledWith(updateData);
      expect(db.update(gameRanks).where).toHaveBeenCalled(); // Similar to getById, specific eq check
      expect(db.update(gameRanks).returning).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedRank);
    });

    it('should return 400 for validation errors on ID (e.g., non-numeric)', async () => {
      const req = mockRequest(updateData, { id: 'abc' }) as Request;
      const res = mockResponse() as Response;

      await gameRankController.updateGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });

    it('should return 400 for validation errors on body (e.g., name too short)', async () => {
      const req = mockRequest({ name: '' }, { id: '1' }) as Request; // Empty name
      const res = mockResponse() as Response;

      await gameRankController.updateGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });

    it('should return 400 if body is empty', async () => {
      const req = mockRequest({}, { id: '1' }) as Request; // Empty body
      const res = mockResponse() as Response;

      await gameRankController.updateGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No fields to update' });
    });

    it('should return 404 when game rank to update is not found', async () => {
      const req = mockRequest(updateData, { id: '999' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([]), // Empty array means not found
      });

      await gameRankController.updateGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Game rank not found or no changes made' });
    });

    it('should return 500 if database update fails', async () => {
      const req = mockRequest(updateData, { id: '1' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });

      await gameRankController.updateGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  // Tests for deleteGameRank
  describe('deleteGameRank', () => {
    it('should soft delete a game rank successfully', async () => {
      const req = mockRequest(null, { id: '1' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([{ id: 1 }]), // Indicates one row affected
      });

      await gameRankController.deleteGameRank(req, res);

      expect(db.update).toHaveBeenCalledWith(gameRanks);
      expect(db.update(gameRanks).set).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
      expect(db.update(gameRanks).where).toHaveBeenCalled(); // Specific eq check
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 for invalid ID format', async () => {
      const req = mockRequest(null, { id: 'abc' }) as Request;
      const res = mockResponse() as Response;

      await gameRankController.deleteGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
    });

    it('should return 404 when game rank to delete is not found', async () => {
      const req = mockRequest(null, { id: '999' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValueOnce([]), // No rows affected
      });

      await gameRankController.deleteGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Game rank not found' });
    });

    it('should return 500 if database update (for soft delete) fails', async () => {
      const req = mockRequest(null, { id: '1' }) as Request;
      const res = mockResponse() as Response;

      (db.update as jest.Mock).mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      });

      await gameRankController.deleteGameRank(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
