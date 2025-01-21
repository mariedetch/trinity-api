import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCommandStatus1736874023877 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Créer un nouveau type enum
    await queryRunner.query(`
            CREATE TYPE "commands_status_enum_new" AS ENUM (
                'INITIATED', 'VALIDATED', 'PAID', 'IN_PROGRESS', 'SHIPPED', 
                'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'
            );
        `);

    // 2. Convertir la colonne vers le nouveau type en remplaçant 'CREATED' par 'INITIATED'
    await queryRunner.query(`
            ALTER TABLE commands 
            ALTER COLUMN status TYPE commands_status_enum_new 
            USING (CASE WHEN status::text = 'CREATED' 
                       THEN 'INITIATED'::commands_status_enum_new 
                       ELSE status::text::commands_status_enum_new 
                  END);
        `);

    // 3. Supprimer l'ancien type
    await queryRunner.query(`DROP TYPE commands_status_enum;`);

    // 4. Renommer le nouveau type
    await queryRunner.query(`
            ALTER TYPE commands_status_enum_new RENAME TO commands_status_enum;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Même processus en sens inverse
    await queryRunner.query(`
            CREATE TYPE "commands_status_enum_new" AS ENUM (
                'CREATED', 'PAID', 'IN_PROGRESS', 'SHIPPED', 
                'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'
            );
        `);

    await queryRunner.query(`
            ALTER TABLE commands 
            ALTER COLUMN status TYPE commands_status_enum_new 
            USING (CASE WHEN status::text = 'INITIATED' 
                       THEN 'CREATED'::commands_status_enum_new 
                       ELSE status::text::commands_status_enum_new 
                  END);
        `);

    await queryRunner.query(`DROP TYPE commands_status_enum;`);

    await queryRunner.query(`
            ALTER TYPE commands_status_enum_new RENAME TO commands_status_enum;
        `);
  }
}
