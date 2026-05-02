import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAmendmentsTable1000000000006 implements MigrationInterface {
  name = 'CreateAmendmentsTable1000000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "amendments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "comment" TEXT NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'PENDING',
        "rejection_reason" TEXT,
        "seen_by_user" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "reviewed_at" TIMESTAMP,
        "reviewed_by" UUID,
        CONSTRAINT "fk_amendments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        CONSTRAINT "fk_amendments_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_amendments_user_id" ON "amendments"("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_amendments_status" ON "amendments"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_amendments_user_status" ON "amendments"("user_id", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "amendments"`);
  }
}
