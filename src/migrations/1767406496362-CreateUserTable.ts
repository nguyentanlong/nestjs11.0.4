import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1767406496362 implements MigrationInterface {
    name = 'CreateUserTable1767406496362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_products" ("id" varchar PRIMARY KEY NOT NULL, "productName" varchar NOT NULL, "keywords" text array, "shortDescription" varchar NOT NULL, "description" text NOT NULL, "media" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "createdBy" varchar NOT NULL, "postDay" datetime NOT NULL DEFAULT (datetime('now')), "editReason" varchar, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_products"("id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted") SELECT "id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "temporary_products" RENAME TO "products"`);
        await queryRunner.query(`CREATE TABLE "temporary_products" ("id" varchar PRIMARY KEY NOT NULL, "productName" varchar NOT NULL, "keywords" text array, "shortDescription" varchar NOT NULL, "description" text NOT NULL, "media" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "createdBy" varchar NOT NULL, "postDay" datetime NOT NULL DEFAULT (datetime('now')), "editReason" varchar, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_products"("id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted") SELECT "id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "temporary_products" RENAME TO "products"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "temporary_products"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" varchar PRIMARY KEY NOT NULL, "productName" varchar NOT NULL, "keywords" text array, "shortDescription" varchar NOT NULL, "description" text NOT NULL, "media" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "createdBy" varchar NOT NULL, "postDay" datetime NOT NULL DEFAULT (datetime('now')), "editReason" varchar, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "products"("id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted") SELECT "id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted" FROM "temporary_products"`);
        await queryRunner.query(`DROP TABLE "temporary_products"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "temporary_products"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" varchar PRIMARY KEY NOT NULL, "productName" varchar NOT NULL, "keywords" text array, "shortDescription" varchar NOT NULL, "description" text NOT NULL, "media" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "createdBy" varchar NOT NULL, "postDay" datetime NOT NULL DEFAULT (datetime('now')), "editReason" varchar, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "products"("id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted") SELECT "id", "productName", "keywords", "shortDescription", "description", "media", "price", "stock", "createdBy", "postDay", "editReason", "likes", "likedUsers", "createdAt", "deleted" FROM "temporary_products"`);
        await queryRunner.query(`DROP TABLE "temporary_products"`);
    }

}
