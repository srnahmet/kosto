import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('kosto_rooms', {
  code: text('code').primaryKey(),
  state: text('state').notNull(),
  version: integer('version').notNull().default(0),
  expiresAt: integer('expires_at').notNull(),
}, t => [index('rooms_expiry').on(t.expiresAt)]);
