import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  resetToken: varchar('resetToken', { length: 255 }),
  resetTokenExpiry: timestamp('resetTokenExpiry'),
  name: varchar('name', { length: 64 }).notNull(),
  gender: varchar('gender', { enum: ['male', 'female', 'other'] }).notNull(),
  dob: varchar('dob', { length: 10 }).notNull(),
  time: varchar('time', { length: 8 }).notNull(),
  latitude: varchar('latitude', { length: 32 }).notNull(),
  longitude: varchar('longitude', { length: 32 }).notNull(),
  timezone: varchar('timezone', { length: 16 }).notNull(),
  place: varchar('place', { length: 128 }).notNull(),
  dailyMessageCount: integer('dailyMessageCount').notNull().default(0),
  lastMessageAt: timestamp('lastMessageAt'),
  isPremium: boolean('isPremium').notNull().default(false),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const astrologicalData = pgTable(
  'AstrologicalData',
  {
    id: uuid('id').notNull().defaultRandom(),
    type: text('type').notNull(),
    content: json('content').notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type AstrologicalData = InferSelectModel<typeof astrologicalData>;

export const district = pgTable(
  'District',
  {
    id: uuid('id').notNull().defaultRandom(),
    districtName: text('districtName').notNull(),
    latitude: varchar('latitude', { length: 32 }).notNull(),
    longitude: varchar('longitude', { length: 32 }).notNull(),
    timeDifference: varchar('timeDifference', { length: 16 }).notNull(),
    timezone: varchar('timezone', { length: 16 }).notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id] }),
    };
  },
);

export type District = InferSelectModel<typeof district>;

export const payment = pgTable(
  'Payment',
  {
    id: uuid('id').notNull().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    amount: integer('amount').notNull(),
    method: varchar('method', { enum: ['khalti', 'esewa','connectips'] }).notNull(),
    status: varchar('status', { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
    transactionId: varchar('transactionId', { length: 64 }).notNull(),
    transactionCode: varchar('transactionCode', { length: 64 }).notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id] }),
    };
  },
);

export type Payment = InferSelectModel<typeof payment>;

export const subscription = pgTable(
  "Subscription",
  {
    id: uuid("id").notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    plan: varchar("plan", { enum: ["free", "weekly", "monthly", "yearly"] }).notNull(),
    status: varchar("status", { enum: ["active", "canceled"] }).notNull().default("active"),
    createdAt: timestamp("createdAt").notNull(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id] }),
    };
  },
);

export type Subscription = InferSelectModel<typeof subscription>;