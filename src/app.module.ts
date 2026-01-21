import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonsModule } from './commons/commons.module';

@Module({
  imports: [CommonsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
