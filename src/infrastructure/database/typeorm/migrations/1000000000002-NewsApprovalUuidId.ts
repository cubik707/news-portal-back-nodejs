import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewsApprovalUuidId1000000000002 implements MigrationInterface {
  name = 'NewsApprovalUuidId1000000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "news_approval"`);
    await queryRunner.query(`
      CREATE TABLE "news_approval" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
}
