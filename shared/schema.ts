import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with email/password and WebAuthn passkey support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"), // Optional - user can use passkey only
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// WebAuthn passkeys for passwordless authentication
export const passkeys = pgTable("passkeys", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("passkeys_user_id_idx").on(table.userId),
}));

// Email provider configuration
export const emailProviders = pgTable("email_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // 'sendpulse', 'brevo', 'mailjet'
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret"),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  dailyLimit: integer("daily_limit").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (table) => ({
  userIdIdx: index("email_providers_user_id_idx").on(table.userId),
}));

// Track daily quota usage per provider
export const providerQuotas = pgTable("provider_quotas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => emailProviders.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  emailsSent: integer("emails_sent").notNull().default(0),
}, (table) => ({
  providerDateIdx: index("provider_quotas_provider_date_idx").on(table.providerId, table.date),
}));

// Recipient lists
export const recipientLists = pgTable("recipient_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("recipient_lists_user_id_idx").on(table.userId),
}));

// Individual recipients
export const recipients = pgTable("recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  metadata: json("metadata"), // Additional fields from CSV/Sheets
  listId: varchar("list_id").notNull().references(() => recipientLists.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  listIdIdx: index("recipients_list_id_idx").on(table.listId),
  emailIdx: index("recipients_email_idx").on(table.email),
}));

// Email templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  htmlContent: text("html_content").notNull(),
  jsonContent: text("json_content"), // GrapesJS JSON
  thumbnail: text("thumbnail"),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("templates_user_id_idx").on(table.userId),
}));

// Email campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  replyTo: text("reply_to").notNull(),
  htmlContent: text("html_content").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  status: text("status").notNull().default("draft"), // 'draft', 'scheduled', 'sending', 'sent', 'failed'
  templateId: varchar("template_id").references(() => templates.id),
  listId: varchar("list_id").references(() => recipientLists.id),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("campaigns_user_id_idx").on(table.userId),
  statusIdx: index("campaigns_status_idx").on(table.status),
}));

// Send logs for tracking individual email sends
export const sendLogs = pgTable("send_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id").notNull().references(() => recipients.id),
  email: text("email").notNull(),
  providerId: varchar("provider_id").notNull().references(() => emailProviders.id),
  status: text("status").notNull(), // 'pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdIdx: index("send_logs_campaign_id_idx").on(table.campaignId),
  statusIdx: index("send_logs_status_idx").on(table.status),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  name: z.string().min(1),
});

export const insertPasskeySchema = createInsertSchema(passkeys).omit({
  createdAt: true,
});

export const insertEmailProviderSchema = createInsertSchema(emailProviders).omit({
  id: true,
}).extend({
  name: z.enum(['sendpulse', 'brevo', 'mailjet']),
  dailyLimit: z.number().int().positive(),
});

export const insertRecipientListSchema = createInsertSchema(recipientLists).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1),
});

export const insertRecipientSchema = createInsertSchema(recipients).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1),
  htmlContent: z.string().min(1),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
}).extend({
  name: z.string().min(1),
  subject: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email(),
  htmlContent: z.string().min(1),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPasskey = z.infer<typeof insertPasskeySchema>;
export type Passkey = typeof passkeys.$inferSelect;

export type InsertEmailProvider = z.infer<typeof insertEmailProviderSchema>;
export type EmailProvider = typeof emailProviders.$inferSelect;

export type ProviderQuota = typeof providerQuotas.$inferSelect;

export type InsertRecipientList = z.infer<typeof insertRecipientListSchema>;
export type RecipientList = typeof recipientLists.$inferSelect;

export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Recipient = typeof recipients.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type SendLog = typeof sendLogs.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  passkeys: many(passkeys),
  recipientLists: many(recipientLists),
  templates: many(templates),
  campaigns: many(campaigns),
  emailProviders: many(emailProviders),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}));

export const recipientListsRelations = relations(recipientLists, ({ one, many }) => ({
  user: one(users, {
    fields: [recipientLists.userId],
    references: [users.id],
  }),
  recipients: many(recipients),
  campaigns: many(campaigns),
}));

export const recipientsRelations = relations(recipients, ({ one }) => ({
  list: one(recipientLists, {
    fields: [recipients.listId],
    references: [recipientLists.id],
  }),
}));

export const emailProvidersRelations = relations(emailProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [emailProviders.userId],
    references: [users.id],
  }),
  quotas: many(providerQuotas),
  sendLogs: many(sendLogs),
}));

export const providerQuotasRelations = relations(providerQuotas, ({ one }) => ({
  provider: one(emailProviders, {
    fields: [providerQuotas.providerId],
    references: [emailProviders.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [campaigns.templateId],
    references: [templates.id],
  }),
  list: one(recipientLists, {
    fields: [campaigns.listId],
    references: [recipientLists.id],
  }),
  sendLogs: many(sendLogs),
}));

export const sendLogsRelations = relations(sendLogs, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [sendLogs.campaignId],
    references: [campaigns.id],
  }),
  recipient: one(recipients, {
    fields: [sendLogs.recipientId],
    references: [recipients.id],
  }),
  provider: one(emailProviders, {
    fields: [sendLogs.providerId],
    references: [emailProviders.id],
  }),
}));
