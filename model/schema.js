import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
        name: 'doserate',
        columns: [
          { name: 'doserate', type: 'number' },
          {name:'cps', type:'number'},
          { name: 'createdAt', type: 'number' , isIndexed: true},
        ],
      }),
    // We'll add tableSchemas here later
  ]
})