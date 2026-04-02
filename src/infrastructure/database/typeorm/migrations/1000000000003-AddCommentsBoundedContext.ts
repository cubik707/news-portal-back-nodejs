import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsBoundedContext1000000000003 implements MigrationInterface {
  name = 'AddCommentsBoundedContext1000000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old SERIAL-based comments table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "content" TEXT NOT NULL,
        "author_id" UUID NOT NULL,
        "news_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "edited_at" TIMESTAMP,
        CONSTRAINT "fk_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id"),
        CONSTRAINT "fk_comments_news" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
  }
}
