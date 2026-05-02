import { MigrationInterface, QueryRunner } from 'typeorm';

export class LikesUuidAndUniqueConstraint1000000000004 implements MigrationInterface {
  name = 'LikesUuidAndUniqueConstraint1000000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "likes"`);

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "news_id" UUID NOT NULL,
        "user_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_likes_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_likes_news_user" UNIQUE ("news_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_likes_user_id" ON "likes" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_likes_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "likes"`);
  }
}
