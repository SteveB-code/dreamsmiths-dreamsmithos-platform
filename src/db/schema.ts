import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const personTypeEnum = pgEnum("person_type", [
  "contractor",
  "employee",
]);

export const personStatusEnum = pgEnum("person_status", [
  "active",
  "inactive",
  "offboarded",
]);

export const platformStatusEnum = pgEnum("platform_status", [
  "active",
  "paused",
  "archived",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "product_lead",
  "contractor",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "contract",
  "sla",
  "compliance_evidence",
  "report",
  "id_document",
  "police_clearance",
  "other",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "pending",
  "submitted",
  "verified",
  "overdue",
  "not_applicable",
]);

export const complianceFrequencyEnum = pgEnum("compliance_frequency", [
  "once",
  "quarterly",
  "annually",
]);

export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "invited",
  "in_progress",
  "completed",
]);

// ============================================================
// BetterAuth tables (managed by BetterAuth, defined here for reference)
// These will be created by BetterAuth's migration. We keep them here
// so Drizzle is aware of them for queries.
// ============================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: userRoleEnum("role").notNull().default("contractor"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================
// Core domain tables
// ============================================================

export const person = pgTable("person", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  idNumber: text("id_number"), // encrypted at application level
  photoUrl: text("photo_url"),
  type: personTypeEnum("type").notNull(),
  status: personStatusEnum("status").notNull().default("active"),
  dateJoined: timestamp("date_joined").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const platform = pgTable("platform", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  clientOrg: text("client_org").notNull(),
  status: platformStatusEnum("status").notNull().default("active"),
  dateOnboarded: timestamp("date_onboarded").defaultNow(),
  retainerTier: text("retainer_tier"),
  techStack: text("tech_stack"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const platformAssignment = pgTable("platform_assignment", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  platformId: uuid("platform_id")
    .notNull()
    .references(() => platform.id, { onDelete: "cascade" }),
  roleOnPlatform: text("role_on_platform").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  dateAssigned: timestamp("date_assigned").defaultNow(),
  dateRemoved: timestamp("date_removed"),
});

export const technology = pgTable("technology", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // "frontend", "backend", "mobile", "cloud", "database", "other"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const personTechnology = pgTable("person_technology", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  technologyId: uuid("technology_id")
    .notNull()
    .references(() => technology.id, { onDelete: "cascade" }),
});

export const platformTechnology = pgTable("platform_technology", {
  id: uuid("id").primaryKey().defaultRandom(),
  platformId: uuid("platform_id")
    .notNull()
    .references(() => platform.id, { onDelete: "cascade" }),
  technologyId: uuid("technology_id")
    .notNull()
    .references(() => technology.id, { onDelete: "cascade" }),
});

export const document = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: documentTypeEnum("type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  personId: uuid("person_id").references(() => person.id, {
    onDelete: "cascade",
  }),
  platformId: uuid("platform_id").references(() => platform.id, {
    onDelete: "cascade",
  }),
  uploadedBy: text("uploaded_by").references(() => user.id),
  version: integer("version").notNull().default(1),
  parentDocumentId: uuid("parent_document_id"),
  accessLevel: text("access_level").notNull().default("private"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const complianceRequirement = pgTable("compliance_requirement", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: complianceFrequencyEnum("frequency").notNull(),
  appliesTo: personTypeEnum("applies_to"),
  evidenceType: text("evidence_type").notNull(), // "file_upload", "self_declaration", "external_verification"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const complianceRecord = pgTable("compliance_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  requirementId: uuid("requirement_id")
    .notNull()
    .references(() => complianceRequirement.id, { onDelete: "cascade" }),
  status: complianceStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date").notNull(),
  submittedDate: timestamp("submitted_date"),
  verifiedBy: text("verified_by").references(() => user.id),
  evidenceDocumentId: uuid("evidence_document_id").references(
    () => document.id,
  ),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const onboardingJourney = pgTable("onboarding_journey", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  status: onboardingStatusEnum("status").notNull().default("invited"),
  currentStep: integer("current_step").notNull().default(1),
  inviteSentDate: timestamp("invite_sent_date"),
  startedDate: timestamp("started_date"),
  completedDate: timestamp("completed_date"),
  isRetrofit: boolean("is_retrofit").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
