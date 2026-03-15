import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from '../../infrastructure/file-storage/file-storage.service';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';

interface DeleteImageBody {
  category: string;
  fileName: string;
}

@Controller()
@UseGuards(JwtAuthGuard, ApprovedGuard)
export class FilesController {
  constructor(private readonly fileStorage: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
  ): Promise<SuccessResponseDto<string>> {
    const filePath = this.fileStorage.saveFile(file, category);
    return new SuccessResponseDto(filePath, 'File uploaded successfully');
  }

  @Delete('delete-image')
  async deleteImage(@Body() body: DeleteImageBody): Promise<SuccessResponseDto<null>> {
    this.fileStorage.deleteFile(body.category, body.fileName);
    return new SuccessResponseDto(null, 'Image deleted successfully');
  }
}
