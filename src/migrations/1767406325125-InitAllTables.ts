import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAllTables1767406325125 implements MigrationInterface {
    name = 'InitAllTables1767406325125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" varchar PRIMARY KEY NOT NULL, "productName" varchar NOT NULL, "keywords" text array, "shortDescription" varchar NOT NULL, "description" text NOT NULL, "media" text, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "createdBy" varchar NOT NULL, "postDay" datetime NOT NULL DEFAULT (datetime('now')), "editReason" varchar, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deleted" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "price" real, "products" json NOT NULL, "totalAmount" float NOT NULL, "status" varchar CHECK( "status" IN ('pending','paid','shipped','delivered','cancelled','returned','partial_cancelled','partial_returned') ) NOT NULL DEFAULT ('pending'), "cancelReason" varchar, "returnReason" varchar, "createdAt" datetime NOT NULL, "updatedAt" datetime)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT (0), "password" varchar NOT NULL, "username" varchar NOT NULL, "address" varchar NOT NULL, "fullName" varchar NOT NULL, "avatar" varchar, "friendly" integer NOT NULL DEFAULT (0), "phone" varchar NOT NULL, "role" varchar CHECK( "role" IN ('admin','staff','user') ) NOT NULL DEFAULT ('user'), "deletedAt" datetime, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" varchar PRIMARY KEY NOT NULL, "content" text NOT NULL, "tags" text, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "userId" varchar NOT NULL, "productId" varchar NOT NULL, "parentId" varchar, "deletedAt" datetime)`);
        await queryRunner.query(`CREATE TABLE "verification_token" ("id" varchar PRIMARY KEY NOT NULL, "jti" varchar NOT NULL, "userId" varchar NOT NULL, "expiresAt" datetime NOT NULL, "used" boolean NOT NULL DEFAULT (0), CONSTRAINT "UQ_6ffec762417eee0dfa5048f9ecb" UNIQUE ("jti"))`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "price" real, "products" json NOT NULL, "totalAmount" float NOT NULL, "status" varchar CHECK( "status" IN ('pending','paid','shipped','delivered','cancelled','returned','partial_cancelled','partial_returned') ) NOT NULL DEFAULT ('pending'), "cancelReason" varchar, "returnReason" varchar, "createdAt" datetime NOT NULL, "updatedAt" datetime, CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "userId", "price", "products", "totalAmount", "status", "cancelReason", "returnReason", "createdAt", "updatedAt") SELECT "id", "userId", "price", "products", "totalAmount", "status", "cancelReason", "returnReason", "createdAt", "updatedAt" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
        await queryRunner.query(`CREATE TABLE "temporary_comment" ("id" varchar PRIMARY KEY NOT NULL, "content" text NOT NULL, "tags" text, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "userId" varchar NOT NULL, "productId" varchar NOT NULL, "parentId" varchar, "deletedAt" datetime, CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1e9f24a68bd2dcd6390a4008395" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_comment"("id", "content", "tags", "likes", "likedUsers", "userId", "productId", "parentId", "deletedAt") SELECT "id", "content", "tags", "likes", "likedUsers", "userId", "productId", "parentId", "deletedAt" FROM "comment"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`ALTER TABLE "temporary_comment" RENAME TO "comment"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME TO "temporary_comment"`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" varchar PRIMARY KEY NOT NULL, "content" text NOT NULL, "tags" text, "likes" integer NOT NULL DEFAULT (0), "likedUsers" text DEFAULT ('{}'), "userId" varchar NOT NULL, "productId" varchar NOT NULL, "parentId" varchar, "deletedAt" datetime)`);
        await queryRunner.query(`INSERT INTO "comment"("id", "content", "tags", "likes", "likedUsers", "userId", "productId", "parentId", "deletedAt") SELECT "id", "content", "tags", "likes", "likedUsers", "userId", "productId", "parentId", "deletedAt" FROM "temporary_comment"`);
        await queryRunner.query(`DROP TABLE "temporary_comment"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "price" real, "products" json NOT NULL, "totalAmount" float NOT NULL, "status" varchar CHECK( "status" IN ('pending','paid','shipped','delivered','cancelled','returned','partial_cancelled','partial_returned') ) NOT NULL DEFAULT ('pending'), "cancelReason" varchar, "returnReason" varchar, "createdAt" datetime NOT NULL, "updatedAt" datetime)`);
        await queryRunner.query(`INSERT INTO "order"("id", "userId", "price", "products", "totalAmount", "status", "cancelReason", "returnReason", "createdAt", "updatedAt") SELECT "id", "userId", "price", "products", "totalAmount", "status", "cancelReason", "returnReason", "createdAt", "updatedAt" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`DROP TABLE "verification_token"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
