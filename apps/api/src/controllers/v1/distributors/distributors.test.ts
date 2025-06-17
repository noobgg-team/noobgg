import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Context } from 'hono';
import { db } from '../../../db';
import {
  createDistributorController,
  updateDistributorController,
} from './distributors.controller';

// Mock the db module
mock.module('../db', () => ({
  db: {
    select: mock().mockReturnThis(),
    from: mock().mockReturnThis(),
    where: mock().mockReturnThis(),
    insert: mock().mockImplementation(() => ({
      values: mock().mockImplementation(() => ({
        returning: mock()
      }))
    })),
    update: mock().mockImplementation(() => ({
      set: mock().mockImplementation(() => ({
        where: mock().mockImplementation(() => ({
          returning: mock()
        }))
      }))
    })),
    delete: mock().mockReturnThis(),
  }
}));

// Mock Hono's context
const mockJson = mock();
const mockReqJson = mock();

const mockContext = (body?: Record<string, unknown>, params?: Record<string, string>) => ({
  req: {
    json: mockReqJson.mockResolvedValue(body || {}),
    param: (key: string) => params?.[key]
  },
  json: mockJson,
}) as unknown as Context;

describe('Distributors Controller', () => {
  beforeEach(() => {
    mockJson.mockClear();
    mockReqJson.mockClear();
  });

  describe('createDistributorController', () => {
    it('should create a distributor successfully', async () => {
      const newDistributor = { name: 'Test Distributor', website: 'http://test.com' };
      const createdDistributor = { id: 1, ...newDistributor };
      
      const returningMock = mock().mockResolvedValue([createdDistributor]);
      const valuesMock = mock().mockReturnValue({ returning: returningMock });
      const insertMock = db.insert as any;
      insertMock.mockReturnValue({ values: valuesMock });

      const c = mockContext(newDistributor);
      await createDistributorController(c);

      expect(db.insert).toHaveBeenCalledWith(expect.anything());
      expect(valuesMock).toHaveBeenCalledWith(newDistributor);
      expect(returningMock).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(createdDistributor, 201);
    });

    it('should return 400 if name is missing', async () => {
      const invalidData = { website: 'http://test.com' };
      const c = mockContext(invalidData);
      await createDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith({
        error: { name: ["Required"] }
      }, 400);
    });

    it('should return 400 if name is too long', async () => {
      const invalidData = { name: 'a'.repeat(256) };
      const c = mockContext(invalidData);
      await createDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        error: { name: expect.arrayContaining(["Name must be 255 characters or less"]) },
      }), 400);
    });

    it('should return 400 if website is too long', async () => {
      const invalidData = { name: 'Valid Name', website: 'http://' + 'a'.repeat(250) + '.com' };
      const c = mockContext(invalidData);
      await createDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        error: { website: expect.arrayContaining(["Website must be 255 characters or less"]) },
      }), 400);
    });

  });

  describe('updateDistributorController', () => {
    it('should update a distributor successfully', async () => {
      const updateData = { name: 'Updated Distributor' };
      const updatedDistributor = { id: 1, name: 'Updated Distributor' };
      
      const returningMock = mock().mockResolvedValue([updatedDistributor]);
      const whereMock = mock().mockReturnValue({ returning: returningMock });
      const setMock = mock().mockReturnValue({ where: whereMock });
      const updateMock = db.update as any;
      updateMock.mockReturnValue({ set: setMock });

      const c = mockContext(updateData, { id: '1' });
      await updateDistributorController(c);

      expect(db.update).toHaveBeenCalledWith(expect.anything());
      expect(setMock).toHaveBeenCalledWith(updateData);
      expect(whereMock).toHaveBeenCalledWith(expect.anything());
      expect(returningMock).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(updatedDistributor);
    });

    it('should return 400 if name is an empty string', async () => {
      const invalidData = { name: '' };
      const c = mockContext(invalidData, { id: '1' });
      await updateDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        error: { name: expect.arrayContaining(["Name cannot be empty"]) },
      }), 400);
    });

    it('should return 400 if website is too long', async () => {
      const invalidData = { website: 'http://' + 'a'.repeat(250) + '.com' };
      const c = mockContext(invalidData, { id: '1' });
      await updateDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        error: { website: expect.arrayContaining(["Website must be 255 characters or less"]) },
      }), 400);
    });

    it('should return 400 for invalid ID', async () => {
      const c = mockContext({ name: 'Valid Data' }, { id: 'abc' });
      await updateDistributorController(c);
      expect(mockJson).toHaveBeenCalledWith({ error: "Invalid id" }, 400);
    });

    it('should return 404 if distributor not found', async () => {
      const updateData = { name: 'Test' };
      
      const returningMock = mock().mockResolvedValue([]);
      const whereMock = mock().mockReturnValue({ returning: returningMock });
      const setMock = mock().mockReturnValue({ where: whereMock });
      const updateMock = db.update as any;
      updateMock.mockReturnValue({ set: setMock });

      const c = mockContext(updateData, { id: '999' });
      await updateDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith({ error: "Distributor not found" }, 404);
    });

    it('should return 400 if no valid fields provided for update', async () => {
      const emptyData = {};
      const c = mockContext(emptyData, { id: '1' });
      await updateDistributorController(c);

      expect(mockJson).toHaveBeenCalledWith({ error: "No valid fields provided for update" }, 400);
    });
  });
});
