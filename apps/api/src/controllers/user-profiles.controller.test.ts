import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Context } from 'hono';
import { ApiError } from '../middleware/errorHandler';

// Helper function for query builder mock
function createQueryBuilderMock() {
  return {
    from: mock().mockReturnThis(),
    where: mock().mockReturnThis(),
    returning: mock(),
    limit: mock(),
  };
}

// Mock the db module BEFORE importing anything that depends on it
mock.module('../db', () => ({
  db: {
    select: mock().mockReturnValue(createQueryBuilderMock()),
    insert: mock().mockReturnValue({
      values: mock().mockReturnValue({ returning: mock() })
    }),
    update: mock().mockReturnValue({
      set: mock().mockReturnValue({
        where: mock().mockReturnValue({ returning: mock() })
      })
    }),
    transaction: mock(),
  }
}));

// Import AFTER mocking
import { db } from '../db';
import {
  getUserProfile,
  getUserProfileByUsername,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from './v1/user-profiles.controller';

// Mock Hono's context
const mockJson = mock();
const mockReqJson = mock();
const mockQuery = mock();

const mockContext = (body?: Record<string, unknown>, params?: Record<string, string>, query?: Record<string, string>) => ({
  req: {
    json: mockReqJson.mockResolvedValue(body || {}),
    param: (key: string) => params?.[key],
    query: (key: string) => query?.[key],
  },
  json: mockJson,
}) as unknown as Context;

describe('UserProfiles Controller', () => {
  beforeEach(() => {
    mockJson.mockClear();
    mockReqJson.mockClear();
    mockQuery.mockClear();

    // Reset db spies to prevent cross-test bleed
    (db.select as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.insert as any).mockReset().mockReturnValue({
      values: mock().mockReturnValue({ returning: mock() }),
    });
    (db.update as any).mockReset().mockReturnValue({
      set: mock().mockReturnValue({
        where: mock().mockReturnValue({ returning: mock() }),
      }),
    });
    (db.transaction as any).mockReset();
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        region: 'europe',
        favoriteGameGenre: 'rpg',
        playerType: 'casual',
        industryRole: 'player',
        lookingFor: 'teammates',
        presenceStatus: 'online',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        lastOnline: new Date(),
        rowVersion: '0',
      };

      const whereMock = mock().mockResolvedValue([mockUser]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { id: '1' });
      await getUserProfile(c);

      expect(db.select).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        region: 'europe',
        favoriteGameGenre: 'rpg',
      }));
    });

    it('should exclude soft-deleted users by default', async () => {
      const mockUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        gender: 'male',
        region: 'europe',
        favoriteGameGenre: 'rpg',
        playerType: 'casual',
        industryRole: 'player',
        lookingFor: 'teammates',
        presenceStatus: 'online',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        lastOnline: new Date(),
        rowVersion: '0',
      };

      const whereMock = mock().mockResolvedValue([mockUser]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { id: '1' });
      await getUserProfile(c);

      expect(whereMock).toHaveBeenCalledWith(expect.anything());
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        deletedAt: null,
      }));
    });

    it('should include soft-deleted users when includeDeleted=true', async () => {
      const mockUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        bannerImageUrl: null,
        bio: null,
        birthDate: null,
        gender: 'unknown',
        region: 'unknown',
        favoriteGameGenre: 'unknown',
        playerType: 'unknown',
        industryRole: 'unknown',
        lookingFor: 'unknown',
        presenceStatus: 'unknown',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: new Date(),
        lastOnline: new Date(),
        rowVersion: '0',
      };

      const whereMock = mock().mockResolvedValue([mockUser]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { id: '1' }, { includeDeleted: 'true' });
      await getUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
      }));
    });

    it('should return 400 for invalid id', async () => {
      const c = mockContext({}, { id: 'invalid' });
      
      await expect(getUserProfile(c)).rejects.toThrow(ApiError);
      await expect(getUserProfile(c)).rejects.toThrow('Invalid id');
    });

    it('should return 404 when user not found', async () => {
      const whereMock = mock().mockResolvedValue([]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { id: '1' });
      
      await expect(getUserProfile(c)).rejects.toThrow(ApiError);
      await expect(getUserProfile(c)).rejects.toThrow('User not found');
    });
  });

  describe('getUserProfileByUsername', () => {
    it('should return user profile by username successfully', async () => {
      const mockUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        region: 'europe',
        favoriteGameGenre: 'rpg',
        playerType: 'casual',
        industryRole: 'player',
        lookingFor: 'teammates',
        presenceStatus: 'online',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
        lastOnline: new Date(),
        rowVersion: '0',
      };

      const whereMock = mock().mockResolvedValue([mockUser]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { username: 'testuser' });
      await getUserProfileByUsername(c);

      expect(db.select).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        userName: 'testuser',
      }));
    });

    it('should return 400 when username is missing', async () => {
      const c = mockContext({}, {});
      
      await expect(getUserProfileByUsername(c)).rejects.toThrow(ApiError);
      await expect(getUserProfileByUsername(c)).rejects.toThrow('Username is required');
    });

    it('should return 404 when user not found', async () => {
      const whereMock = mock().mockResolvedValue([]);
      const fromMock = mock().mockReturnValue({ where: whereMock });
      const selectMock = db.select as any;
      selectMock.mockReturnValue({ from: fromMock });

      const c = mockContext({}, { username: 'nonexistent' });
      
      await expect(getUserProfileByUsername(c)).rejects.toThrow(ApiError);
      await expect(getUserProfileByUsername(c)).rejects.toThrow('User not found');
    });
  });

  describe('createUserProfile', () => {
    const validUserData = {
      userKeycloakId: 'keycloak-123',
      userName: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      gender: 'male',
      region: 'europe',
      favoriteGameGenre: 'rpg',
      playerType: 'casual',
      industryRole: 'player',
      lookingFor: 'teammates',
      presenceStatus: 'online',
    };

    it('should create user profile successfully with all new fields', async () => {
      const createdUser = {
        id: BigInt(1),
        ...validUserData,
        createdAt: new Date(),
        lastOnline: new Date(),
        rowVersion: '0',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([])
            })
          }),
          insert: mock().mockReturnValue({
            values: mock().mockReturnValue({
              returning: mock().mockResolvedValue([createdUser])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validUserData);
      await createUserProfile(c);

      expect(db.transaction).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User profile created successfully",
          data: expect.objectContaining({
            id: '1',
            userKeycloakId: 'keycloak-123',
            userName: 'testuser',
            favoriteGameGenre: 'rpg',
            playerType: 'casual',
            rowVersion: '0',
          })
        }),
        201
      );
    });

    it('should use default enum values when not provided', async () => {
      const minimalUserData = {
        userKeycloakId: 'keycloak-456',
        userName: 'minimaluser',
      };

      const createdUser = {
        id: BigInt(2),
        ...minimalUserData,
        gender: 'unknown',
        region: 'unknown',
        favoriteGameGenre: 'unknown',
        playerType: 'unknown',
        industryRole: 'unknown',
        lookingFor: 'unknown',
        presenceStatus: 'unknown',
        createdAt: new Date(),
        lastOnline: new Date(),
        rowVersion: '0',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([])
            })
          }),
          insert: mock().mockReturnValue({
            values: mock().mockReturnValue({
              returning: mock().mockResolvedValue([createdUser])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(minimalUserData);
      await createUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gender: 'unknown',
            region: 'unknown',
            favoriteGameGenre: 'unknown',
            playerType: 'unknown',
            industryRole: 'unknown',
            lookingFor: 'unknown',
            presenceStatus: 'unknown',
          })
        }),
        201
      );
    });

    it('should return 400 for invalid enum values', async () => {
      const invalidData = {
        ...validUserData,
        gender: 'invalid-gender',
      };
      const c = mockContext(invalidData);
      
      await expect(createUserProfile(c)).rejects.toThrow(ApiError);
    });

    it('should return 409 when Keycloak ID already exists', async () => {
      const existingUser = { id: BigInt(2), userKeycloakId: 'keycloak-123' };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([existingUser])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validUserData);
      
      await expect(createUserProfile(c)).rejects.toThrow(ApiError);
      await expect(createUserProfile(c)).rejects.toThrow('Keycloak ID already exists');
    });

    it('should return 409 when username already exists', async () => {
      const existingUser = { id: BigInt(2), userName: 'testuser' };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock()
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([])
              })
            })
            .mockReturnValueOnce({
              from: mock().mockReturnValue({
                where: mock().mockResolvedValue([existingUser])
              })
            })
        };
        return await callback(txMock);
      });

      const c = mockContext(validUserData);
      
      await expect(createUserProfile(c)).rejects.toThrow(ApiError);
      await expect(createUserProfile(c)).rejects.toThrow('Username already exists');
    });
  });

  describe('updateUserProfile', () => {
    const validUpdateData = {
      firstName: 'Updated',
      lastName: 'Name',
      favoriteGameGenre: 'moba',
      playerType: 'competitive',
      rowVersion: '0',
    };

    it('should update user profile successfully', async () => {
      const currentUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        rowVersion: '0',
      };

      const updatedUser = {
        ...currentUser,
        firstName: 'Updated',
        lastName: 'Name',
        favoriteGameGenre: 'moba',
        playerType: 'competitive',
        updatedAt: new Date(),
        rowVersion: '1',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          }),
          update: mock().mockReturnValue({
            set: mock().mockReturnValue({
              where: mock().mockReturnValue({
                returning: mock().mockResolvedValue([updatedUser])
              })
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validUpdateData, { id: '1' });
      await updateUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User profile updated successfully",
          data: expect.objectContaining({
            id: '1',
            firstName: 'Updated',
            lastName: 'Name',
            favoriteGameGenre: 'moba',
            playerType: 'competitive',
            rowVersion: '1',
          })
        }),
        200
      );
    });

    it('should return 409 for optimistic concurrency conflict', async () => {
      const currentUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        rowVersion: '5', // Different from request
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext(validUpdateData, { id: '1' });
      
      await expect(updateUserProfile(c)).rejects.toThrow(ApiError);
      await expect(updateUserProfile(c)).rejects.toThrow('Resource has been modified by another user');
    });

    it('should return 400 for empty payload (excluding rowVersion)', async () => {
      const c = mockContext({ rowVersion: '0' }, { id: '1' });
      
      await expect(updateUserProfile(c)).rejects.toThrow(ApiError);
      await expect(updateUserProfile(c)).rejects.toThrow('No data provided');
    });

    it('should increment rowVersion on successful update', async () => {
      const currentUser = {
        id: BigInt(1),
        rowVersion: '42',
      };

      const updatedUser = {
        ...currentUser,
        firstName: 'Updated',
        rowVersion: '43', // Should be incremented
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          }),
          update: mock().mockReturnValue({
            set: mock().mockReturnValue({
              where: mock().mockReturnValue({
                returning: mock().mockResolvedValue([updatedUser])
              })
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext({ firstName: 'Updated', rowVersion: '42' }, { id: '1' });
      await updateUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rowVersion: '43',
          })
        }),
        200
      );
    });
  });

  describe('deleteUserProfile', () => {
    it('should soft delete user profile successfully', async () => {
      const currentUser = {
        id: BigInt(1),
        userKeycloakId: 'keycloak-123',
        userName: 'testuser',
        deletedAt: null,
        rowVersion: '2',
      };

      const deletedUser = {
        ...currentUser,
        deletedAt: new Date(),
        updatedAt: new Date(),
        rowVersion: '3',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          }),
          update: mock().mockReturnValue({
            set: mock().mockReturnValue({
              where: mock().mockReturnValue({
                returning: mock().mockResolvedValue([deletedUser])
              })
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext({}, { id: '1' });
      await deleteUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User profile deleted successfully",
          data: expect.objectContaining({
            id: '1',
            rowVersion: '3',
          })
        }),
        200
      );
    });

    it('should return 409 when user already deleted', async () => {
      const currentUser = {
        id: BigInt(1),
        deletedAt: new Date(),
        rowVersion: '2',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext({}, { id: '1' });
      
      await expect(deleteUserProfile(c)).rejects.toThrow(ApiError);
      await expect(deleteUserProfile(c)).rejects.toThrow('User already deleted');
    });

    it('should increment rowVersion on deletion', async () => {
      const currentUser = {
        id: BigInt(1),
        deletedAt: null,
        rowVersion: '99',
      };

      const deletedUser = {
        ...currentUser,
        deletedAt: new Date(),
        updatedAt: new Date(),
        rowVersion: '100',
      };

      (db.transaction as any).mockImplementation(async (callback: any) => {
        const txMock = {
          select: mock().mockReturnValue({
            from: mock().mockReturnValue({
              where: mock().mockResolvedValue([currentUser])
            })
          }),
          update: mock().mockReturnValue({
            set: mock().mockReturnValue({
              where: mock().mockReturnValue({
                returning: mock().mockResolvedValue([deletedUser])
              })
            })
          })
        };
        return await callback(txMock);
      });

      const c = mockContext({}, { id: '1' });
      await deleteUserProfile(c);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rowVersion: '100',
          })
        }),
        200
      );
    });
  });
});