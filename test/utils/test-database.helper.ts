import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestDatabaseHelper {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    async cleanDatabase() {
        const entities = this.dataSource.entityMetadatas;

        for (const entity of entities) {
            const repository = this.dataSource.getRepository(
                entity.name,
            );
            await repository.query(
                `TRUNCATE TABLE "${entity.tableName}" CASCADE;`,
            );
        }
    }

    async closeConnection() {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }
}
