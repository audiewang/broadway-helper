import { pgTable, serial, varchar, text, timestamp, integer, decimal, date, time, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Shows table
export const shows = pgTable('shows', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  theater: varchar('theater', { length: 255 }).notNull(),
  funFact: text('fun_fact'),
  newbieTip: text('newbie_tip'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  slugIdx: index('idx_shows_slug').on(table.slug),
}));

// Listings table
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  showId: integer('show_id').notNull().references(() => shows.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 100 }).notNull(),
  date: date('date').notNull(),
  time: time('time').notNull(),
  section: varchar('section', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  url: text('url'),
  lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  showIdIdx: index('idx_listings_show_id').on(table.showId),
  dateIdx: index('idx_listings_date').on(table.date),
  lastSeenIdx: index('idx_listings_last_seen').on(table.lastSeen),
  uniqueListing: uniqueIndex('unique_listing').on(table.showId, table.source, table.date, table.time, table.section, table.price),
}));

// Community tips table
export const communityTips = pgTable('community_tips', {
  id: serial('id').primaryKey(),
  showId: integer('show_id').notNull().references(() => shows.id, { onDelete: 'cascade' }),
  tipType: varchar('tip_type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  upvotes: integer('upvotes').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  showIdIdx: index('idx_community_tips_show_id').on(table.showId),
  upvotesIdx: index('idx_community_tips_upvotes').on(table.upvotes),
}));

// Theaters table
export const theaters = pgTable('theaters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Theater sections table
export const theaterSections = pgTable('theater_sections', {
  id: serial('id').primaryKey(),
  theaterId: integer('theater_id').notNull().references(() => theaters.id, { onDelete: 'cascade' }),
  sectionName: varchar('section_name', { length: 100 }).notNull(),
  qualityScore: integer('quality_score'),
  priceRange: varchar('price_range', { length: 100 }),
  tip: text('tip'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  theaterIdIdx: index('idx_theater_sections_theater_id').on(table.theaterId),
  uniqueTheaterSection: uniqueIndex('unique_theater_section').on(table.theaterId, table.sectionName),
}));

// Relations
export const showsRelations = relations(shows, ({ many }) => ({
  listings: many(listings),
  communityTips: many(communityTips),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  show: one(shows, {
    fields: [listings.showId],
    references: [shows.id],
  }),
}));

export const communityTipsRelations = relations(communityTips, ({ one }) => ({
  show: one(shows, {
    fields: [communityTips.showId],
    references: [shows.id],
  }),
}));

export const theatersRelations = relations(theaters, ({ many }) => ({
  sections: many(theaterSections),
}));

export const theaterSectionsRelations = relations(theaterSections, ({ one }) => ({
  theater: one(theaters, {
    fields: [theaterSections.theaterId],
    references: [theaters.id],
  }),
}));

// Type exports
export type Show = typeof shows.$inferSelect;
export type NewShow = typeof shows.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type CommunityTip = typeof communityTips.$inferSelect;
export type NewCommunityTip = typeof communityTips.$inferInsert;
export type Theater = typeof theaters.$inferSelect;
export type NewTheater = typeof theaters.$inferInsert;
export type TheaterSection = typeof theaterSections.$inferSelect;
export type NewTheaterSection = typeof theaterSections.$inferInsert;