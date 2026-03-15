import { Module } from '@nestjs/common';
import { FileStorageModule } from '../../infrastructure/file-storage/file-storage.module';
import { FilesController } from './files.controller';

@Module({
  imports: [FileStorageModule],
  controllers: [FilesController],
})
export class FilesModule {}
