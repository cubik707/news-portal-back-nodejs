import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsViews1000000000007 implements MigrationInterface {
  name = 'AddNewsViews1000000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "news_views" (
        "id"        UUID      NOT NULL DEFAULT gen_random_uuid(),
        "news_id"   UUID      NOT NULL,
        "user_id"   UUID      NOT NULL,
        "viewed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_news_views" PRIMARY KEY ("id"),
        CONSTRAINT "uq_news_views_news_user" UNIQUE ("news_id", "user_id"),
        CONSTRAINT "fk_news_views_news" FOREIGN KEY ("news_id")
          REFERENCES "news"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_news_views_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_news_views_user_id" ON "news_views"("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_news_views_news_id" ON "news_views"("news_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "news_views"`);
  }
}
