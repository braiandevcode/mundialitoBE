import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1781229000000 implements MigrationInterface {
  name = 'InitialSchema1781229000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`avatar\` varchar(255) NULL,
        \`role\` varchar(10) NOT NULL DEFAULT 'user',
        \`total_points\` int NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`last_login_at\` timestamp NULL,
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`teams\` (
        \`id\` varchar(5) NOT NULL,
        \`name\` varchar(50) NOT NULL,
        \`country_code\` varchar(5) NOT NULL,
        \`group_id\` varchar(2) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`matches\` (
        \`id\` varchar(20) NOT NULL,
        \`group_id\` varchar(2) NULL,
        \`round\` varchar(10) NULL,
        \`match_number\` int NOT NULL,
        \`home_team_id\` varchar(5) NOT NULL,
        \`away_team_id\` varchar(5) NOT NULL,
        \`date\` datetime NOT NULL,
        \`status\` varchar(15) NOT NULL DEFAULT 'scheduled',
        \`home_score\` int NULL,
        \`away_score\` int NULL,
        \`extra_home_score\` int NULL,
        \`extra_away_score\` int NULL,
        \`penalty_home_score\` int NULL,
        \`penalty_away_score\` int NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`predictions\` (
        \`id\` varchar(40) NOT NULL,
        \`user_id\` varchar(128) NOT NULL,
        \`match_id\` varchar(20) NOT NULL,
        \`home_score\` int NOT NULL,
        \`away_score\` int NOT NULL,
        \`extra_home_score\` int NULL,
        \`extra_away_score\` int NULL,
        \`penalty_winner\` varchar(4) NULL,
        \`points\` int NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_predictions_user_match\` (\`user_id\`, \`match_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`ranking_entries\` (
        \`id\` varchar(36) NOT NULL,
        \`round_id\` varchar(255) NOT NULL,
        \`round_label\` varchar(255) NOT NULL,
        \`user_id\` varchar(255) NOT NULL,
        \`user_name\` varchar(255) NOT NULL,
        \`avatar\` varchar(255) NULL,
        \`total_points\` int NOT NULL,
        \`predictions_count\` int NOT NULL,
        \`exact_scores\` int NOT NULL,
        \`success_rate\` int NOT NULL,
        \`position\` int NOT NULL,
        UNIQUE INDEX \`IDX_ranking_entries_round_user\` (\`round_id\`, \`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`sponsors\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`banner_url\` varchar(255) NOT NULL,
        \`link_url\` varchar(255) NOT NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`display_order\` int NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`matches\`
      ADD CONSTRAINT \`FK_matches_home_team\`
      FOREIGN KEY (\`home_team_id\`) REFERENCES \`teams\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`matches\`
      ADD CONSTRAINT \`FK_matches_away_team\`
      FOREIGN KEY (\`away_team_id\`) REFERENCES \`teams\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`predictions\`
      ADD CONSTRAINT \`FK_predictions_user\`
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`predictions\`
      ADD CONSTRAINT \`FK_predictions_match\`
      FOREIGN KEY (\`match_id\`) REFERENCES \`matches\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `predictions` DROP FOREIGN KEY `FK_predictions_match`');
    await queryRunner.query('ALTER TABLE `predictions` DROP FOREIGN KEY `FK_predictions_user`');
    await queryRunner.query('ALTER TABLE `matches` DROP FOREIGN KEY `FK_matches_away_team`');
    await queryRunner.query('ALTER TABLE `matches` DROP FOREIGN KEY `FK_matches_home_team`');
    await queryRunner.query('DROP TABLE `sponsors`');
    await queryRunner.query('DROP TABLE `ranking_entries`');
    await queryRunner.query('DROP TABLE `predictions`');
    await queryRunner.query('DROP TABLE `matches`');
    await queryRunner.query('DROP TABLE `teams`');
    await queryRunner.query('DROP TABLE `users`');
  }
}
