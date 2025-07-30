import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const files = sqliteTable("files", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: integer("created_at").notNull().$defaultFn(() => new Date().getTime()),
    updatedAt: integer("updated_at").notNull().$defaultFn(() => new Date().getTime()),
});
