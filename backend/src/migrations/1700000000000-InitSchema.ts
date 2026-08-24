import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1700000000000 implements MigrationInterface {
  name = "InitSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "code" character varying(32) NOT NULL,
        CONSTRAINT "UQ_roles_code" UNIQUE ("code"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "uuid" uuid NOT NULL,
        "fullName" character varying(255) NOT NULL,
        "phone" character varying(64) NOT NULL,
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "roleId" integer NOT NULL,
        "teamName" character varying(255),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("uuid"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "work_orders" (
        "uuid" uuid NOT NULL,
        "assigneeId" uuid,
        "scheduledAt" TIMESTAMPTZ NOT NULL,
        "address" character varying(500) NOT NULL,
        "status" character varying(32) NOT NULL,
        "description" text NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        CONSTRAINT "PK_work_orders" PRIMARY KEY ("uuid"),
        CONSTRAINT "FK_work_orders_assignee" FOREIGN KEY ("assigneeId") REFERENCES "users"("uuid") ON DELETE SET NULL,
        CONSTRAINT "FK_work_orders_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("uuid")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_work_orders_status" ON "work_orders" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_work_orders_assignee" ON "work_orders" ("assigneeId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "work_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }
}
