import { pgTable, uuid, varchar, text, boolean, timestamp, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== Users ====================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_username').on(table.username),
]);

// ==================== Prompts ====================
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  currentVersionId: uuid('current_version_id'),
  draftContent: text('draft_content'),
  status: varchar('status', { length: 20 }).default('draft').$type<'draft' | 'published' | 'published_with_updates'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_prompts_user_id').on(table.userId),
  index('idx_prompts_status').on(table.status),
  index('idx_prompts_updated_at').on(table.updatedAt),
  index('idx_prompts_user_status').on(table.userId, table.status),
]);

// ==================== Prompt Versions ====================
export const promptVersions = pgTable('prompt_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  content: text('content').notNull(),
  description: text('description'),
  changelog: text('changelog'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_versions_prompt_id').on(table.promptId),
  index('idx_versions_published').on(table.promptId, table.isPublished),
  uniqueIndex('idx_unique_version').on(table.promptId, table.versionNumber),
]);

// ==================== Tags ====================
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#6366f1'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_tags_user_id').on(table.userId),
  uniqueIndex('idx_unique_user_tag').on(table.userId, table.name),
]);

// ==================== Prompt Tags (Junction) ====================
export const promptTags = pgTable('prompt_tags', {
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.promptId, table.tagId] }),
  index('idx_prompt_tags_tag_id').on(table.tagId),
]);

// ==================== Relations ====================
export const usersRelations = relations(users, ({ many }) => ({
  prompts: many(prompts),
  tags: many(tags),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  user: one(users, { fields: [prompts.userId], references: [users.id] }),
  currentVersion: one(promptVersions, { fields: [prompts.currentVersionId], references: [promptVersions.id] }),
  versions: many(promptVersions),
  promptTags: many(promptTags),
}));

export const promptVersionsRelations = relations(promptVersions, ({ one }) => ({
  prompt: one(prompts, { fields: [promptVersions.promptId], references: [prompts.id] }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  promptTags: many(promptTags),
}));

export const promptTagsRelations = relations(promptTags, ({ one }) => ({
  prompt: one(prompts, { fields: [promptTags.promptId], references: [prompts.id] }),
  tag: one(tags, { fields: [promptTags.tagId], references: [tags.id] }),
}));
