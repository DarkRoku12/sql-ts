import 'jasmine'
import * as DatabaseFactory from './DatabaseFactory';
const rewire = require('rewire')

let RewireDatabaseFactory = rewire('./DatabaseFactory')
const MockDatabaseFactory: typeof DatabaseFactory & typeof RewireDatabaseFactory = <any> RewireDatabaseFactory

describe('DatabaseFactory', () => {
  describe('buildDatabase', () => {
    it('should instantiate a database and destroy the connection', async (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.returnValue(mockKnex)
      const mockTableTasks = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(['table1', 'table2']))
      }
      const mockEnumTasks = {
        getAllEnumTables: jasmine.createSpy('getAllEnumTables').and.returnValues(Promise.resolve(['enum1', 'enum2']))
      }
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
        TableTasks: mockTableTasks,
        EnumTasks: mockEnumTasks
      })
      const mockConfig = {} as any
      const dat = await MockDatabaseFactory.buildDatabase(mockConfig) as any
      expect(mockKnexImport).toHaveBeenCalledWith(mockConfig)
      expect(mockTableTasks.getAllTables).toHaveBeenCalledWith(mockKnex, mockConfig)
      expect(mockKnex.destroy).toHaveBeenCalled()
      expect(dat).toEqual({
        tables: ['table1', 'table2'],
        enums: ['enum1', 'enum2']
      })
      done()
    })
    it('should throw an error when an error occurs', async (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.throwError("knex error")
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
      })
      const mockConfig = {} as any
      try {
        await MockDatabaseFactory.buildDatabase(mockConfig)
      } catch (err) {
        expect(err.message).toBe("knex error")
        done()
      }
    })
  })
})
