import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { Context } from 'hono';
import { db } from '../db';
import { languages as languagesTableSchema } from '../db/schemas/languages.drizzle';
import {
  createLanguage,
  updateLanguage,
  getLanguages,
  // getLanguageById, // Add other functions if tests are written for them
  // getAllLanguages,
  // deleteLanguage,
} from './languages.controller'; // Assuming this is where your controller functions are
import { z } from 'zod'; // For ZodError simulation if needed

// --- Mocking Drizzle ORM and db object ---
const mockDbInstance = {
  select: mock().mockReturnThis(),
  from: mock().mockReturnThis(),
  where: mock().mockReturnThis(),
  orderBy: mock().mockReturnThis(),
  limit: mock().mockReturnThis(),
  offset: mock().mockReturnThis(),
  insert: mock().mockImplementation(() => ({
    values: mock().mockImplementation((valuesToInsert) => ({
      returning: mock().mockImplementation(() => Promise.resolve([valuesToInsert])) // Simulate returning the inserted value
    }))
  })),
  update: mock().mockImplementation(() => ({
    set: mock().mockImplementation((valuesToSet) => ({
      where: mock().mockImplementation(() => ({
        returning: mock().mockImplementation(() => Promise.resolve([])) // Default to not found for update
      }))
    }))
  })),
  // Add count mock for pagination in getLanguages
  count: mock().mockImplementation(() => Promise.resolve(0)), // used as db.select({ count: count() })...
};

// Deeper mock for count() specifically for getLanguages
const mockTotalRecordsQuery = { count: mock().mockResolvedValue(0) };
const mockDbSelectForCount = mock().mockImplementation(() => ({
    from: mock().mockImplementation(() => ({
        where: mock().mockResolvedValue([mockTotalRecordsQuery]) // Simulates [{ count: N }]
    }))
}));


mock.module('../db', () => ({
  db: {
    ...mockDbInstance,
    // Special handling for select when it might be for count
    select: mock((selectArg: any) => {
      if (selectArg && typeof selectArg === 'object' && 'count' in selectArg) {
        return mockDbSelectForCount; // Use the count-specific mock
      }
      // Default select behavior for data queries
      // This structure allows chaining like db.select().from().where()...offset()
      // and the final call (e.g. offset() or the whole chain if awaited directly after select())
      // should resolve to a promise.
      const queryChainer = {
        from: mock().mockReturnThis(),
        where: mock().mockReturnThis(),
        orderBy: mock().mockReturnThis(),
        limit: mock().mockReturnThis(),
        // offset is the typical terminal method for getLanguages data query.
        // It should return a Promise.
        offset: mock().mockResolvedValue([]), // Default to resolving with an empty array

        // If select() itself can be awaited without further chaining in some use cases:
        // then: (callback: any) => callback([]), // This was the old problematic approach.
        // Instead, select itself would need to be mockResolvedValue if it's directly awaited.
        // However, the typical usage in this controller is db.select().from(...)...
        // So, the methods on the object returned by select() are important.
      };
      // Ensure from, where, etc., return the queryChainer to allow chaining.
      queryChainer.from = mock(() => queryChainer);
      queryChainer.where = mock(() => queryChainer);
      queryChainer.orderBy = mock(() => queryChainer);
      queryChainer.limit = mock(() => queryChainer);
      // queryChainer.offset is already defined above to return a Promise.

      // For the rare case `await db.select()` is used directly for data (not typical with Drizzle for complex queries)
      // and needs to be a promise, then `select` itself should be `mock().mockResolvedValue([])`.
      // But since we return `queryChainer` which has promise-returning terminal methods, this covers the chained calls.
      return queryChainer;
    }),
  }
}));

mock.module('drizzle-orm', async (actual) => {
  const actualOrm = await actual;
  return {
    ...actualOrm,
    eq: mock((col: any, val: any) => ({ column: col, value: val, operator: 'eq' })),
    ne: mock((col: any, val: any) => ({ column: col, value: val, operator: 'ne' })),
    isNull: mock((col: any) => ({ column: col, operator: 'isNull' })),
    and: mock((...args: any[]) => ({ conditions: args, operator: 'and' })),
    or: mock((...args: any[]) => ({ conditions: args, operator: 'or' })),
    ilike: mock((col: any, val: any) => ({ column: col, value: val, operator: 'ilike' })),
    asc: mock((col: any) => ({ column: col, direction: 'asc' })),
    desc: mock((col: any) => ({ column: col, direction: 'desc' })),
    count: mock(() => 'drizzle-count-mock'), // This mock is for the count() SQL function
  };
});


// --- Mocking Hono's Context ---
const mockResJson = mock();
const mockReqJson = mock(); // For req.json()
const mockReqQuery = mock(); // For req.query()
const mockReqParam = mock(); // For req.param()

const mockContext = (
  body?: Record<string, unknown> | null, // Allow null for body
  params?: Record<string, string>,
  query?: Record<string, string>
) => {
  mockReqJson.mockReset(); // Reset before each use
  if (body !== undefined) {
    mockReqJson.mockResolvedValue(body);
  }

  return {
    req: {
      json: mockReqJson,
      param: mockReqParam.mockImplementation((key: string) => params?.[key]),
      query: mockReqQuery.mockImplementation((key: string) => query?.[key]), // For individual query params
      url: `http://localhost/test_path${query ? '?' + new URLSearchParams(query).toString() : ''}`, // For full query string parsing by Zod
    },
    json: mockResJson,
    status: mock((statusCode: number) => { // Mock the status function
      // console.log(`Context status called with: ${statusCode}`);
    }),
  } as unknown as Context;
};


describe('Languages Controller', () => {
  let mockExistingLanguage: any;

  beforeEach(() => {
    mockResJson?.mockClear?.();
    mockReqJson?.mockClear?.(); // Also reset in mockContext, but clear here for consistency
    mockReqParam?.mockClear?.();
    mockReqQuery?.mockClear?.();
    mockContext()?.status?.mockClear?.(); // Clearing status mock as per example, though context is a fn

    // Reset all db method mocks in mockDbInstance
    Object.values(mockDbInstance).forEach(m => {
      m?.mockClear?.(); // Clears the top-level mock function (e.g., db.select, db.insert)

      // If the mock itself returned other mocks that need clearing,
      // they should ideally be cleared directly if they are stored on `m` or handled by `mockReset` if appropriate.
      // The previous deep iteration was complex and might not be standard.
      // Bun's `mockClear` clears .mock property, which includes calls, instances, results.
      // If `m` is a mock that returns another mock function object (e.g. `db.insert().values()`),
      // then `values` itself would need to be cleared if it were a persistent mock object.
      // However, the current structure redefines implementations on each call or uses mockReturnThis.
      // Let's ensure specific nested mocks that are explicitly defined and reused are cleared.
      if (m === mockDbInstance.insert) {
        // Example if `values` or `returning` were persistent mocks attached to `m.insert`
        // m.values?.mockClear?.(); // This depends on how values is structured
        // m.values()?.returning?.mockClear?.(); // If values() returns an object with a returning mock
      }
      // Similar logic for `update` if `set`, `where`, `returning` were persistent mocks
    });

    // Clear specific, potentially nested, and reused mocks explicitly
    // For mockDbSelectForCount which is a mock function
    (mockDbSelectForCount as any)?.mockClear?.();
    // And its returned 'from' mock if 'from' itself is a separate mock function object
    mockDbSelectForCount?.from?.mockClear?.();
    // And the 'where' mock if it's a separate mock function object returned by 'from()'
    // mockDbSelectForCount?.from?.().where?.mockClear?.(); // This line is tricky because from() is called.

    // For mockTotalRecordsQuery which is an object with a mock function 'count'
    mockTotalRecordsQuery?.count?.mockClear?.();

    // The most reliable way is to clear the direct mock functions.
    // If a mock function `A` returns another mock function `B`, then `B` needs to be cleared separately
    // if it maintains state across tests. The `mockDbInstance` clear above handles the first level.

    // Re-evaluating the nested mocks:
    // The `insert` and `update` mocks in `mockDbInstance` are defined with `mock().mockImplementation(...)`
    // where the implementation returns an object with further mock functions.
    // E.g., `db.insert().values().returning()`.
    // `mockDbInstance.insert.mockClear()` clears `insert`.
    // The `values` and `returning` mocks are created fresh on each call due to `mockImplementation`.
    // So, clearing `mockDbInstance.insert` should be enough for its chain unless intermediate results are stored.

    // Let's stick to clearing the main mocks and explicitly defined helper mocks.
    // The previous Object.values loop handles members of mockDbInstance.

    mockExistingLanguage = {
      id: 1n, // Use BigInt for ID as in schema
      name: 'Original Language',
      code: 'OL',
      flagUrl: 'http://original.com/flag.png',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  });

  afterEach(() => {
    // Verify all mocks are called as expected or reset them.
  });

  describe('updateLanguage', () => {
    it('should update only the name if only name is provided', async () => {
      const updatePayload = { name: 'Updated Language Name' };
      const expectedUpdatedLanguage = { ...mockExistingLanguage, name: updatePayload.name, updatedAt: expect.any(Date) };

      // Mock db.select for checking existence (finds the language)
      (db.select as any).mockImplementationOnce(() => ({
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([mockExistingLanguage]) // Simulate language found
      }));

      // Mock db.update().set().where().returning()
      const returningMock = mock().mockResolvedValue([expectedUpdatedLanguage]);
      const whereMock = mock().mockReturnValue({ returning: returningMock });
      const setMock = mock().mockReturnValue({ where: whereMock });
      (db.update as any).mockReturnValue({ set: setMock });

      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);

      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ name: updatePayload.name, updatedAt: expect.any(Date) }));
      expect(setMock.mock.calls[0][0].code).toBeUndefined();
      expect(setMock.mock.calls[0][0].flagUrl).toBeUndefined();
      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({ ...expectedUpdatedLanguage, id: '1' }), // ID is stringified
      );
    });

    it('should update flagUrl to null if explicitly provided as null', async () => {
      const updatePayload = { flagUrl: null };
      const expectedUpdatedLanguage = { ...mockExistingLanguage, flagUrl: null, updatedAt: expect.any(Date) };

      (db.select as any).mockImplementationOnce(() => ({ // For existence check
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([mockExistingLanguage])
      }));
      const returningMock = mock().mockResolvedValue([expectedUpdatedLanguage]);
      (db.update as any).mockReturnValue({ set: mock().mockReturnValue({ where: mock().mockReturnValue({ returning: returningMock }) }) });

      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);

      expect((db.update as any)().set).toHaveBeenCalledWith(expect.objectContaining({ flagUrl: null, updatedAt: expect.any(Date) }));
      expect((db.update as any)().set.mock.calls[0][0].name).toBeUndefined();
      expect((db.update as any)().set.mock.calls[0][0].code).toBeUndefined();
      expect(mockResJson).toHaveBeenCalledWith(
         expect.objectContaining({ ...expectedUpdatedLanguage, id: '1', flagUrl: null })
      );
    });

    it('should update flagUrl to a new URL if provided', async () => {
      const updatePayload = { flagUrl: 'http://new.com/flag.png' };
      const expectedUpdatedLanguage = { ...mockExistingLanguage, flagUrl: updatePayload.flagUrl, updatedAt: expect.any(Date) };

      (db.select as any).mockImplementationOnce(() => ({ // For existence check
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([mockExistingLanguage])
      }));
      const returningMock = mock().mockResolvedValue([expectedUpdatedLanguage]);
      (db.update as any).mockReturnValue({ set: mock().mockReturnValue({ where: mock().mockReturnValue({ returning: returningMock }) }) });


      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);

      expect((db.update as any)().set).toHaveBeenCalledWith(expect.objectContaining({ flagUrl: updatePayload.flagUrl, updatedAt: expect.any(Date) }));
      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({ ...expectedUpdatedLanguage, id: '1' })
      );
    });

    it('should not update other fields if only one field is provided', async () => {
      const updatePayload = { code: 'NU' };
      const expectedUpdatedLanguage = { ...mockExistingLanguage, code: updatePayload.code, updatedAt: expect.any(Date) };

      (db.select as any).mockImplementationOnce(() => ({ // For existence check
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([mockExistingLanguage])
      }));
      const returningMock = mock().mockResolvedValue([expectedUpdatedLanguage]);
      (db.update as any).mockReturnValue({ set: mock().mockReturnValue({ where: mock().mockReturnValue({ returning: returningMock }) }) });


      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);

      expect((db.update as any)().set).toHaveBeenCalledWith(expect.objectContaining({ code: updatePayload.code, updatedAt: expect.any(Date) }));
      expect((db.update as any)().set.mock.calls[0][0].name).toBeUndefined();
      expect((db.update as any)().set.mock.calls[0][0].flagUrl).toBeUndefined(); // Original flagUrl should be preserved
      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({ ...expectedUpdatedLanguage, id: '1', name: mockExistingLanguage.name, flagUrl: mockExistingLanguage.flagUrl })
      );
    });

     it('should return 400 if no fields to update are provided (all undefined)', async () => {
      const updatePayload = {}; // Empty payload
      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);
      expect(mockResJson).toHaveBeenCalledWith({ message: 'No fields to update' }, 400);
    });

    it('should return 404 if language to update is not found', async () => {
      const updatePayload = { name: 'Any Name' };

      (db.select as any).mockImplementationOnce(() => ({ // For existence check
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([]) // Simulate language not found
      }));

      const c = mockContext(updatePayload, { id: '999' });
      await updateLanguage(c);
      expect(mockResJson).toHaveBeenCalledWith({ message: 'Language not found or has been deleted' }, 404);
    });

     it('should return 409 if updated code conflicts with an existing language', async () => {
      const updatePayload = { code: 'CONFLICT' };
      const conflictingLanguage = { ...mockExistingLanguage, id: 2n, code: 'CONFLICT' };

      // First db.select for existence check of the language being updated
      (db.select as any).mockImplementationOnce(() => ({
        from: mock().mockReturnThis(),
        where: mock().mockResolvedValue([mockExistingLanguage]) // Language with id '1' exists
      }));

      // Second db.select for conflict check on the new code
      (db.select as any).mockImplementationOnce(() => ({
        from: mock().mockReturnThis(),
        where: mock().mockReturnThis(), // for the AND conditions
        limit: mock().mockResolvedValue([conflictingLanguage]) // Simulate conflict found
      }));

      const c = mockContext(updatePayload, { id: '1' });
      await updateLanguage(c);
      expect(mockResJson).toHaveBeenCalledWith({ message: 'A language with this code already exists.' }, 409);
    });
  });

  describe('getLanguages (Search Sanitization)', () => {
    const langSpecialChars1 = { id: 1n, name: 'test_lang_1', code: 'TL1', flagUrl: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    const langSpecialChars2 = { id: 2n, name: 'test%lang_2', code: 'TL2', flagUrl: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    const langSpecialChars3 = { id: 3n, name: 'another_test_lang', code: 'ATL', flagUrl: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    const allLangsWithSpecialChars = [langSpecialChars1, langSpecialChars2, langSpecialChars3];

    beforeEach(() => {
      // Default mock for db.select().from().where().orderBy().limit().offset() to return empty array
      // and db.select({ count: count() }).from().where() to return [{ count: 0 }]
      // This can be overridden in specific tests if needed.

      // This beforeEach in describe('getLanguages (Search Sanitization)')
      // sets up specific mocks for getLanguages tests.
      // The global db.select mock (fixed above) is a general default.
      // This specific setup for getLanguages tests should remain,
      // but it also needs to ensure its terminal methods correctly return promises.

      // Original structure in this specific beforeEach:
      // const mockQueryChain = {
      //   orderBy: mock().mockReturnThis(),
      //   limit: mock().mockReturnThis(),
      //   offset: mock().mockReturnThis(),
      //   then: (callback: any) => callback([]), // This was problematic
      // };
      // const fromMock = mock().mockImplementation(() => ({
      //   ...mockQueryChain,
      //   where: mock().mockImplementation(() => mockQueryChain)
      // }));
      // (db.select as any).mockImplementation((selectArg?: any) => { ... });
      // This will be superseded by the setupDbSelectForGetLanguages if that's called.
      // If we want a default for getLanguages tests *before* setupDbSelectForGetLanguages is called,
      // it should also follow the new pattern.

      // Let's ensure the default behavior within this describe block, if any test runs
      // before setupDbSelectForGetLanguages, is also correct.
      // The global mock is already fixed. This local override might not be strictly necessary
      // if setupDbSelectForGetLanguages is always called.
      // For safety, if any test in this block *doesn't* call setupDbSelectForGetLanguages,
      // it would fall back to the main db.select mock defined outside this describe block.
      // That main mock is now corrected. So, this specific (db.select as any).mockImplementation
      // in this beforeEach might be redundant or could be removed if setupDbSelectForGetLanguages
      // is always used in this describe block.

      // For now, let's assume setupDbSelectForGetLanguages will correctly set up the chain
      // to resolve as a promise for each test that needs it.
      // The critical fix was for the main default mock of db.select.
    });

    const setupDbSelectForGetLanguages = (
        filteredLangs: any[],
        totalCount: number
    ) => {
        const mockQueryResult = {
            orderBy: mock().mockReturnThis(),
            limit: mock().mockReturnThis(),
            offset: mock().mockReturnThis(),
            // then: (callback: (res: any[]) => void) => callback(filteredLangs.map(l => ({...l, id: l.id.toString() }))) // Old
            // Ensure the terminal part of this chain (offset) resolves.
            // The 'mockQueryResult' should BE the promise, or the function returning it.
            // So, offset should be mock().mockResolvedValue(data)
        };

        // This helper function is responsible for setting up the mock for a specific test.
        // It needs to ensure the final part of the chain is a promise.
        (db.select as any).mockImplementation((selectFields?: any) => {
            if (selectFields && selectFields.count) { // Handling the count query
                return {
                    from: mock().mockReturnThis(),
                    where: mock().mockResolvedValue([{ count: totalCount }])
                };
            }
            // Handling the data query
            // The object returned here must have its terminal method (e.g., offset) return a promise.
            return {
                from: mock().mockReturnThis(),
                where: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                limit: mock().mockReturnThis(),
                offset: mock().mockResolvedValue(filteredLangs.map(l => ({...l, id: l.id.toString() }))), // Make offset resolve
            };
        });
    };


    it('should return only "test_lang_1" and "another_test_lang" when searching for "_lang_"', async () => {
      const query = { search: '_lang_' };
      // We expect the ilike to be with `%\_lang\_%` due to sanitization and added wildcards
      // The mock DB needs to simulate this filtering.
      // For this test, assume the DB mock will be configured to return based on the *original* search term
      // and the controller's sanitization will correctly form the SQL.
      // The important part is that `escapeLikePattern` is called.

      const expectedResult = [langSpecialChars1, langSpecialChars3];
      setupDbSelectForGetLanguages(expectedResult, expectedResult.length);

      const c = mockContext(null, {}, query);
      await getLanguages(c);

      // Check that ilike was called with the sanitized pattern containing '\_'
      const selectCall = (db.select as any).mock.calls.find((call: any) => call[0] === undefined || call[0].count === undefined); // find the data select call
      const whereConditions = (selectCall.from().where as any).mock.calls[0][0]; // get the 'and' conditions

      // Find the 'or' condition for search
      const orCondition = whereConditions.conditions.find((c:any) => c.operator === 'or');
      expect(orCondition).toBeDefined();
      // Check name and code ilike patterns
      expect(orCondition.conditions[0].value).toBe('%\\_lang\\_%'); // Sanitized by escapeLikePattern + wrapped with %
      expect(orCondition.conditions[1].value).toBe('%\\_lang\\_%');


      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedResult.map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({ totalRecords: expectedResult.length }),
        })
      );
    });

    it('should return only "test%lang_2" when searching for "%lang_"', async () => {
      const query = { search: '%lang_' };
      const expectedResult = [langSpecialChars2];
      setupDbSelectForGetLanguages(expectedResult, expectedResult.length);

      const c = mockContext(null, {}, query);
      await getLanguages(c);

      const selectCall = (db.select as any).mock.calls.find((call: any) => call[0] === undefined || call[0].count === undefined);
      const whereConditions = (selectCall.from().where as any).mock.calls[0][0];
      const orCondition = whereConditions.conditions.find((c:any) => c.operator === 'or');
      expect(orCondition).toBeDefined();
      expect(orCondition.conditions[0].value).toBe('%\\%lang\\_%');
      expect(orCondition.conditions[1].value).toBe('%\\%lang\\_%');

      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedResult.map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({ totalRecords: expectedResult.length }),
        })
      );
    });

    it('should return only "test_lang_1" when searching for "test_"', async () => {
      const query = { search: 'test_' };
      const expectedResult = [langSpecialChars1];
      setupDbSelectForGetLanguages(expectedResult, expectedResult.length);

      const c = mockContext(null, {}, query);
      await getLanguages(c);

      const selectCall = (db.select as any).mock.calls.find((call: any) => call[0] === undefined || call[0].count === undefined);
      const whereConditions = (selectCall.from().where as any).mock.calls[0][0];
      const orCondition = whereConditions.conditions.find((c:any) => c.operator === 'or');
      expect(orCondition).toBeDefined();
      expect(orCondition.conditions[0].value).toBe('%test\\_%');
      expect(orCondition.conditions[1].value).toBe('%test\\_%');

      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedResult.map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({ totalRecords: expectedResult.length }),
        })
      );
    });

    it('should return only "test%lang_2" when searching for "test%"', async () => {
      const query = { search: 'test%' };
      const expectedResult = [langSpecialChars2];
      setupDbSelectForGetLanguages(expectedResult, expectedResult.length);

      const c = mockContext(null, {}, query);
      await getLanguages(c);

      const selectCall = (db.select as any).mock.calls.find((call: any) => call[0] === undefined || call[0].count === undefined);
      const whereConditions = (selectCall.from().where as any).mock.calls[0][0];
      const orCondition = whereConditions.conditions.find((c:any) => c.operator === 'or');
      expect(orCondition).toBeDefined();
      expect(orCondition.conditions[0].value).toBe('%test\\%%');
      expect(orCondition.conditions[1].value).toBe('%test\\%%');

      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedResult.map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({ totalRecords: expectedResult.length }),
        })
      );
    });

    it('should handle search with no special characters correctly', async () => {
      const query = { search: 'another' };
      const expectedResult = [langSpecialChars3];
      setupDbSelectForGetLanguages(expectedResult, expectedResult.length);

      const c = mockContext(null, {}, query);
      await getLanguages(c);

      const selectCall = (db.select as any).mock.calls.find((call: any) => call[0] === undefined || call[0].count === undefined);
      const whereConditions = (selectCall.from().where as any).mock.calls[0][0];
      const orCondition = whereConditions.conditions.find((c:any) => c.operator === 'or');
      expect(orCondition).toBeDefined();
      expect(orCondition.conditions[0].value).toBe('%another%'); // No escaping needed
      expect(orCondition.conditions[1].value).toBe('%another%');

      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expectedResult.map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({ totalRecords: expectedResult.length }),
        })
      );
    });
     it('should return paginated results when no search term is provided', async () => {
      const query = { page: '1', limit: '2' }; // Requesting page 1, 2 items
      const allLangs = [langSpecialChars1, langSpecialChars2, langSpecialChars3];
      // Simulate DB returning only the first 2 for the data query, and 3 for total count
      setupDbSelectForGetLanguages([langSpecialChars1, langSpecialChars2], allLangs.length);


      const c = mockContext(null, {}, query);
      await getLanguages(c);

      expect(mockResJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [langSpecialChars1, langSpecialChars2].map(l => ({ ...l, id: l.id.toString() })),
          pagination: expect.objectContaining({
            page: 1,
            limit: 2,
            totalPages: 2, // Math.ceil(3 / 2)
            totalRecords: allLangs.length,
          }),
        })
      );
    });
  });
});

// Helper to simulate ZodError if needed for other tests
// const createZodError = (issues: z.ZodIssue[]) => {
//   return new z.ZodError(issues);
// };
