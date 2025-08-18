generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------------------------------------------------------------- //
// -------------------- MODÈLES PRINCIPAUX ------------------------ //
// ---------------------------------------------------------------- //

/// *
/// * Tool Model
/// * Represents an AI tool in the directory.
model Tool {
  id                Int               @id @default(autoincrement())
  toolName          String            @map("tool_name") @db.VarChar(255)
  toolCategory      String?           @map("tool_category") @db.VarChar(100)
  toolLink          String?           @map("tool_link") @db.Text
  overview          String?           @db.Text
  toolDescription   String?           @map("tool_description") @db.Text
  imageUrl          String?           @map("image_url") @db.Text
  slug              String?           @unique @db.VarChar(255)
  isActive          Boolean?          @default(true) @map("is_active")
  featured          Boolean?          @default(false)
  quality_score     Decimal?          @default(0.0) @db.Decimal(3, 1)
  metaTitle         String?           @map("meta_title") @db.VarChar(255)
  metaDescription   String?           @map("meta_description") @db.Text
  pricingModel      PricingModel?     @map("pricing_model")
  httpStatusCode    Int?              @map("http_status_code")
  mailAddress       String?           @map("mail_address") @db.VarChar(255)
  docsLink          String?           @map("docs_link") @db.Text
  affiliateLink     String?           @map("affiliate_link") @db.Text
  changelogLink     String?           @map("changelog_link") @db.Text
  socialLinkedin    String?           @map("social_linkedin") @db.Text
  socialFacebook    String?           @map("social_facebook") @db.Text
  socialX           String?           @map("social_x") @db.Text
  socialGithub      String?           @map("social_github") @db.Text
  socialDiscord     String?           @map("social_discord") @db.Text
  socialInstagram   String?           @map("social_instagram") @db.Text
  socialTiktok      String?           @map("social_tiktok") @db.Text
  
  viewCount         Int?              @default(0) @map("view_count")
  clickCount        Int?              @default(0) @map("click_count")
  favoriteCount     Int?              @default(0) @map("favorite_count")
  createdAt         DateTime?         @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime?         @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)
  lastCheckedAt     DateTime?         @default(now()) @map("last_checked_at") @db.Timestamp(6)
  last_optimized_at DateTime?         @db.Timestamp(6)

  translations      ToolTranslation[]
  tags              ToolTag[]
  categories        ToolCategory[]

  @@map("tools")
}

/// *
/// * Post Model
/// * Represents a single blog post, article, or news item.
model Post {
  id                 Int               @id @default(autoincrement())
  slug               String            @unique @db.VarChar(255)
  authorId           Int               @map("author_id")
  status             PostStatus        @default(DRAFT)
  postType           PostType          @default(ARTICLE) @map("post_type")
  featuredImageUrl   String?           @map("featured_image_url") @db.Text
  createdAt          DateTime          @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt          DateTime          @updatedAt @map("updated_at") @db.Timestamp(6)
  publishedAt        DateTime?         @map("published_at")
  isFeatured         Boolean           @default(false) @map("is_featured")
  allowComments      Boolean           @default(true) @map("allow_comments")
  viewCount          Int               @default(0) @map("view_count")
  readingTimeMinutes Int?              @map("reading_time_minutes")

  author             admin_users       @relation(fields: [authorId], references: [id], onDelete: Restrict)
  translations       PostTranslation[]
  comments           Comment[]
  categories         PostCategory[]    
  tags               PostTag[]         

  @@map("posts")
}

// ---------------------------------------------------------------- //
// -------------------- TAXONOMIES (Partagées) --------------------- //
// ---------------------------------------------------------------- //

/// *
/// * Category Model
/// * Shared by Tools and Posts for unified site navigation.
model Category {
  id           Int                   @id @default(autoincrement())
  name         String                @db.VarChar(100)
  slug         String?               @unique @db.VarChar(100)
  description  String?               @db.Text
  iconName     String?               @map("icon_name") @db.VarChar(50)
  toolCount    Int?                  @default(0) @map("tool_count")
  isFeatured   Boolean?              @default(false) @map("is_featured")
  createdAt    DateTime?             @default(now()) @map("created_at") @db.Timestamp(6)
  
  translations CategoryTranslation[]
  posts        PostCategory[]
  tools        ToolCategory[]

  @@map("categories")
}

/// *
/// * Tag Model
/// * Shared by Tools and Posts for flexible content discovery.
model Tag {
  id          Int       @id @default(autoincrement())
  name        String    @db.VarChar(50)
  slug        String?   @unique @db.VarChar(50)
  usageCount  Int?      @default(0) @map("usage_count")
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  description String?   @db.Text
  imageUrl    String?   @map("image_url") @db.Text

  posts       PostTag[]
  tools       ToolTag[]
  translations TagTranslation[]

  @@map("tags")
}


// ---------------------------------------------------------------- //
// -------------------- MODÈLES DE TRADUCTION --------------------- //
// ---------------------------------------------------------------- //

/// *
/// * Tool Translation Model
model ToolTranslation {
  id                Int       @id @default(autoincrement())
  toolId            Int       @map("tool_id")
  languageCode      String    @map("language_code") @db.VarChar(2)
  name              String    @db.VarChar(255)
  overview          String?   @db.Text
  description       String?   @db.Text
  metaTitle         String?   @map("meta_title") @db.VarChar(255)
  metaDescription   String?   @map("meta_description") @db.Text
  translationSource String?   @default("auto") @map("translation_source") @db.VarChar(20)
  createdAt         DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  useCases          String?   @map("use_cases") @db.Text
  keyFeatures       String?   @map("key_features") @db.Text
  targetAudience    String?   @map("target_audience") @db.Text

  language          Language  @relation(fields: [languageCode], references: [code], onDelete: NoAction)
  tool              Tool      @relation(fields: [toolId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@unique([toolId, languageCode])
  @@index([toolId])
  @@map("tool_translations")
}

/// *
/// * Post Translation Model
model PostTranslation {
  id                Int       @id @default(autoincrement())
  postId            Int       @map("post_id")
  languageCode      String    @map("language_code") @db.VarChar(2)
  title             String    @db.VarChar(255)
  content           String    @db.Text
  excerpt           String?   @db.Text
  metaTitle         String?   @map("meta_title") @db.VarChar(255)
  metaDescription   String?   @map("meta_description") @db.Text
  translationSource String    @default("auto") @map("translation_source") @db.VarChar(20)
  humanReviewed     Boolean   @default(false) @map("human_reviewed")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  post              Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  language          Language  @relation(fields: [languageCode], references: [code])

  @@unique([postId, languageCode])
  @@map("post_translations")
}

/// *
/// * Category Translation Model
model CategoryTranslation {
  id                Int       @id @default(autoincrement())
  categoryId        Int       @map("category_id")
  languageCode      String    @map("language_code") @db.VarChar(2)
  name              String    @db.VarChar(100)
  description       String?   @db.Text
  translationSource String?   @default("auto") @map("translation_source") @db.VarChar(20)
  humanReviewed     Boolean?  @default(false) @map("human_reviewed")
  createdAt         DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)
  category          Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  language          Language  @relation(fields: [languageCode], references: [code], onDelete: NoAction)

  @@unique([categoryId, languageCode])
  @@map("category_translations")
}

/// *
/// * Tag Translation Model
model TagTranslation {
  id                Int       @id @default(autoincrement())
  tagId             Int       @map("tag_id")
  languageCode      String    @map("language_code") @db.VarChar(2)
  name              String    @db.VarChar(50)
  description       String?   @db.Text
  translationSource String?   @default("auto") @map("translation_source") @db.VarChar(20)
  createdAt         DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt         DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  tag               Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  language          Language  @relation(fields: [languageCode], references: [code])

  @@unique([tagId, languageCode])
  @@map("tag_translations")
}


// ---------------------------------------------------------------- //
// -------------------- TABLES DE JONCTION (M2M) ------------------ //
// ---------------------------------------------------------------- //

model PostCategory {
  postId     Int      @map("post_id")
  categoryId Int      @map("category_id")
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([postId, categoryId])
  @@map("post_categories")
}

model PostTag {
  postId Int @map("post_id")
  tagId  Int @map("tag_id")
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([postId, tagId])
  @@map("post_tags")
}

model ToolCategory {
  toolId     Int      @map("tool_id")
  categoryId Int      @map("category_id")
  tool       Tool     @relation(fields: [toolId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([toolId, categoryId])
  @@map("tool_categories")
}

model ToolTag {
  toolId Int @map("tool_id")
  tagId  Int @map("tag_id")
  tool   Tool @relation(fields: [toolId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([toolId, tagId])
  @@map("tool_tags")
}


// ---------------------------------------------------------------- //
// -------------------- MODÈLES SYSTÈME & ADMIN -------------------- //
// ---------------------------------------------------------------- //

/// *
/// * Language Model
model Language {
  code                 String                @id @db.VarChar(2)
  name                 String                @db.VarChar(50)
  nativeName           String                @map("native_name") @db.VarChar(50)
  flagEmoji            String?               @map("flag_emoji") @db.VarChar(10)
  enabled              Boolean?              @default(true)
  fallbackLanguage     String?               @map("fallback_language") @db.VarChar(2)
  sortOrder            Int?                  @default(0) @map("sort_order")
  createdAt            DateTime?             @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt            DateTime?             @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)
  
  categoryTranslations CategoryTranslation[]
  toolTranslations     ToolTranslation[]
  postTranslations     PostTranslation[]
  tagTranslations      TagTranslation[]
  fallbackLang         Language?             @relation("LanguageFallback", fields: [fallbackLanguage], references: [code], onDelete: NoAction, onUpdate: NoAction, map: "fk_languages_fallback")
  fallbackFor          Language[]            @relation("LanguageFallback")

  @@map("languages")
}

/// *
/// * admin_users Model
model admin_users {
  id                 Int                  @id @default(autoincrement())
  email              String               @unique @db.VarChar(255)
  password_hash      String               @db.VarChar(255)
  name               String               @db.VarChar(255)
  role               UserRole             @default(EDITOR)
  avatar_url         String?              @db.Text
  is_active          Boolean?             @default(true)
  created_at         DateTime?            @default(now()) @db.Timestamptz(6)
  updated_at         DateTime?            @default(now()) @db.Timestamptz(6)
  last_login_at      DateTime?            @db.Timestamptz(6)
  
  admin_activity_log admin_activity_log[]
  admin_sessions     admin_sessions[]
  posts              Post[]

  @@index([email])
  @@map("admin_users")
}

/// *
/// * Comment Model
model Comment {
  id          Int           @id @default(autoincrement())
  postId      Int           @map("post_id")
  authorName  String        @map("author_name") @db.VarChar(255)
  authorEmail String        @map("author_email") @db.VarChar(255)
  content     String        @db.Text
  status      CommentStatus @default(PENDING)
  parentId    Int?          @map("parent_id")
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamp(6)
  
  post        Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent      Comment?      @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Comment[]     @relation("CommentReplies")

  @@map("comments")
}

model admin_activity_log {
  id            Int          @id @default(autoincrement())
  user_id       Int?
  action        String       @db.VarChar(100)
  resource_type String?      @db.VarChar(50)
  resource_id   Int?
  details       Json?
  ip_address    String?      @db.Inet
  user_agent    String?
  created_at    DateTime?    @default(now()) @db.Timestamptz(6)
  admin_users   admin_users? @relation(fields: [user_id], references: [id], onUpdate: NoAction)
  @@index([user_id])
}

model admin_sessions {
  id            Int          @id @default(autoincrement())
  user_id       Int?
  session_token String       @unique @db.VarChar(255)
  expires_at    DateTime     @db.Timestamptz(6)
  created_at    DateTime?    @default(now()) @db.Timestamptz(6)
  admin_users   admin_users? @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  @@index([user_id])
}


// ---------------------------------------------------------------- //
// ---------------------------- ENUMS ----------------------------- //
// ---------------------------------------------------------------- //

enum PostStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  TRASHED
}

enum PostType {
  ARTICLE
  NEWS
  PAGE
}

enum CommentStatus {
  PENDING
  APPROVED
  SPAM
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
}

enum PricingModel {
  FREE
  FREEMIUM
  SUBSCRIPTION
  ONE_TIME_PAYMENT
  USAGE_BASED
  CONTACT_FOR_PRICING
}