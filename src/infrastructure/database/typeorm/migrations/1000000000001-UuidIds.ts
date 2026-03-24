import { MigrationInterface, QueryRunner } from 'typeorm';

export class UuidIds1000000000001 implements MigrationInterface {
  name = 'UuidIds1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop dependent tables first (reverse dependency order)
    await queryRunner.query(`DROP TABLE IF EXISTS "news_approval"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users_info"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Recreate with UUID primary keys
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" VARCHAR(50) NOT NULL UNIQUE,
        "email" VARCHAR NOT NULL,
        "password_hash" VARCHAR NOT NULL,
        "is_approved" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users_info" (
        "user_id" UUID PRIMARY KEY,
        "last_name" VARCHAR(100) NOT NULL,
        "first_name" VARCHAR(100) NOT NULL,
        "surname" VARCHAR(100),
        "avatar_url" VARCHAR,
        "position" VARCHAR(100),
        "department" VARCHAR(100),
        CONSTRAINT "fk_users_info_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" UUID NOT NULL,
        "role_id" INTEGER NOT NULL,
        PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "news_categories" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "user_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        PRIMARY KEY ("user_id", "category_id"),
        CONSTRAINT "fk_user_subs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_user_subs_category" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        CONSTRAINT "uq_tags_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "news" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR NOT NULL,
        "content" TEXT NOT NULL,
        "image" VARCHAR,
        "author_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'draft',
        "published_at" TIMESTAMP,
        "scheduled_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_news_author" FOREIGN KEY ("author_id") REFERENCES "users"("id"),
        CONSTRAINT "fk_news_category" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "news_tags" (
        "news_id" UUID NOT NULL,
        "tag_id" UUID NOT NULL,
        PRIMARY KEY ("news_id", "tag_id"),
        CONSTRAINT "fk_news_tags_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_news_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL PRIMARY KEY,
        "news_id" UUID NOT NULL,
        "user_id" UUID NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_comments_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" SERIAL PRIMARY KEY,
        "news_id" UUID NOT NULL,
        "user_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_likes_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" SERIAL PRIMARY KEY,
        "news_id" UUID,
        "message" TEXT NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_notifications_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_notifications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" UUID NOT NULL,
        "notification_id" INTEGER NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_notifs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_user_notifs_notification" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "news_approval" (
        "id" SERIAL PRIMARY KEY,
        "news_id" UUID NOT NULL,
        "editor_id" UUID NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'pending',
        "comment" TEXT,
        "reviewed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_news_approval_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_news_approval_editor" FOREIGN KEY ("editor_id") REFERENCES "users"("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "news_approval"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users_info"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
