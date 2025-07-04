import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Context } from 'hono';

// Mock ID generator utility FIRST
mock.module('../../utils/id-generator', () => ({
  generateSnowflakeId: mock().mockReturnValue(BigInt(1))
}));

// Mock BigInt serializer utility
mock.module('../../utils/bigint-serializer', () => ({
  convertBigIntToString: mock().mockImplementation((obj) => ({
    ...obj,
    id: obj.id?.toString() || '1',
    userProfileId: obj.userProfileId?.toString() || '1'
  }))
}));

// Mock translation utility
mock.module('../../utils/translation', () => ({
  getTranslation: mock().mockReturnValue('Validation failed')
}));

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
mock.module('../../db', () => ({
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
    delete: mock().mockReturnValue({
      where: mock().mockReturnValue({ returning: mock() })
    }),
  }
}));



// Import AFTER mocking
import { db } from '../../db';
import {
  createUserSocialLinkController,
  updateUserSocialLinkController,
  getUserSocialLinkByIdController,
  deleteUserSocialLinkController,
} from './user-social-links.controller';

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

describe('🔴 SECURITY: User Social Links Controller', () => {
  beforeEach(() => {
    mockJson.mockClear();
    mockReqJson.mockClear();

    // Reset db spies to prevent cross-test bleed
    (db.select as any).mockReset().mockReturnValue(createQueryBuilderMock());
    (db.insert as any).mockReset().mockReturnValue({
      values: mock().mockReturnValue({ returning: mock().mockResolvedValue([{
        id: BigInt(1),
        userProfileId: BigInt(1),
        platform: 'discord',
        url: 'https://discord.com/user/test',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]) }),
    });
    (db.update as any).mockReset().mockReturnValue({
      set: mock().mockReturnValue({
        where: mock().mockReturnValue({ 
          returning: mock().mockResolvedValue([{
            id: BigInt(1),
            userProfileId: BigInt(1),
            platform: 'discord',
            url: 'https://discord.com/user/updated',
            updatedAt: new Date(),
          }])
        }),
      }),
    });
  });

  describe('🛡️ SQL Injection Protection', () => {
    it('should reject SQL injection in userProfileId', async () => {
      const maliciousPayload = {
        userProfileId: "'; DROP TABLE users; --",
        platform: 'discord',
        url: 'https://discord.com/test'
      };

      const c = mockContext(maliciousPayload);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        // Zod transform errors become 500 in catch block
        expect([400, 500]).toContain(error.status);
        expect(error.message).toBeDefined();
      }

      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should reject non-numeric userProfileId', async () => {
      const invalidPayload = {
        userProfileId: 'not-a-number',
        platform: 'discord',
        url: 'https://discord.com/test'
      };

      const c = mockContext(invalidPayload);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        // Zod transform errors become 500 in catch block
        expect([400, 500]).toContain(error.status);
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('🛡️ XSS Attack Protection', () => {
    it('should reject XSS in platform field', async () => {
      const xssPayload = {
        userProfileId: 1,
        platform: "<script>alert('XSS')</script>",
        url: 'https://discord.com/test'
      };

      const c = mockContext(xssPayload);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('platform');
      }

      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should reject javascript: URLs', async () => {
      const maliciousUrl = {
        userProfileId: 1,
        platform: 'discord',
        url: "javascript:alert('XSS')"
      };

      const c = mockContext(maliciousUrl);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('url');
      }
    });

    it('should reject data: URLs', async () => {
      const maliciousUrl = {
        userProfileId: 1,
        platform: 'discord',
        url: "data:text/html,<script>alert('XSS')</script>"
      };

      const c = mockContext(maliciousUrl);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('url');
      }
    });
  });

  describe('🛡️ DoS Attack Protection', () => {
    it('should reject oversized URL (>255 chars)', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(300);
      const dosPayload = {
        userProfileId: 1,
        platform: 'discord',
        url: longUrl
      };

      const c = mockContext(dosPayload);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('url');
      }
    });
  });

  describe('🛡️ Platform Enum Validation', () => {
    it('should reject invalid platform', async () => {
      const invalidPlatform = {
        userProfileId: 1,
        platform: 'invalid_platform',
        url: 'https://example.com'
      };

      const c = mockContext(invalidPlatform);

      try {
        await createUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('platform');
      }
    });

    it('should accept valid platforms', async () => {
      const validPlatforms = ['discord', 'github', 'twitch', 'youtube'];
      
      for (const platform of validPlatforms) {
        const validPayload = {
          userProfileId: 1,
          platform,
          url: 'https://example.com'
        };

        const c = mockContext(validPayload);
        await createUserSocialLinkController(c);

        expect(db.insert).toHaveBeenCalled();
        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'User social link added successfully'
          }),
          201
        );

        // Reset mocks for next iteration
        mockJson.mockClear();
        (db.insert as any).mockClear();
      }
    });
  });

  describe('✅ Valid Data Acceptance', () => {
    it('should create social link with valid data', async () => {
      const validPayload = {
        userProfileId: 1,
        platform: 'discord',
        url: 'https://discord.com/users/123456789'
      };

      const c = mockContext(validPayload);
      await createUserSocialLinkController(c);

      expect(db.insert).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User social link added successfully',
          data: expect.objectContaining({
            id: '1',
            platform: 'discord'
          })
        }),
        201
      );
    });
  });

  describe('🛡️ Update Security Tests', () => {
    it('should reject malicious update data', async () => {
      const maliciousUpdate = {
        platform: "<script>alert('XSS')</script>",
        url: "javascript:alert('XSS')"
      };

      const c = mockContext(maliciousUpdate, { id: '1' });

      try {
        await updateUserSocialLinkController(c);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('platform');
      }

      expect(db.update).not.toHaveBeenCalled();
    });

    it('should update with valid data', async () => {
      const validUpdate = {
        platform: 'github',
        url: 'https://github.com/testuser'
      };

      const c = mockContext(validUpdate, { id: '1' });
      await updateUserSocialLinkController(c);

      expect(db.update).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User social link updated successfully'
        }),
        200
      );
    });
  });
});
