import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 5,
  tables: [
    tableSchema({
      name: "doserate",
      columns: [
        { name: "doserate", type: "number" },
        { name: "cps", type: "number" },
        { name: "createdAt", type: "number", isIndexed: true },
      ],
    }),
    tableSchema({
      name: "sessions",
      columns: [
        { name: "sessionName", type: "string" },
        { name: "timeLimit", type: "number", isOptional: true },
        { name: "timeInterval", type: "number", isOptional: true },
        { name: "createdAt", type: "number", isIndexed: true },
        { name: "stoppedAt", type: "number", isIndexed: true },
      ],
    }),
    tableSchema({
      name: "sessionData",
      columns: [
        { name: "sessionId", type: "string", isIndexed: true },
        { name: "data", type: "string" , isOptional: true },
        { name: "timestamp", type: "number", isIndexed: true },
      ],
    })
  ],
});
