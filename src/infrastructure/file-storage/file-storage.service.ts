import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class FileStorageService {
  private readonly uploadDir: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads';
  }

  async saveFile(file: UploadedFile, category: string): Promise<string> {
    const dir = path.join(this.uploadDir, category);
    await fs.promises.mkdir(dir, { recursive: true });
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(dir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    return `${category}/${fileName}`;
  }

  async deleteFile(category: string, fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, category, fileName);
    await fs.promises.unlink(filePath).catch(() => {});
  }
}
