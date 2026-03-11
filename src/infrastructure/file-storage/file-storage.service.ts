import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class FileStorageService {
  private readonly uploadDir: string;

  constructor(private readonly config: ConfigService) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads';
  }

  saveFile(file: UploadedFile, category: string): string {
    const dir = path.join(this.uploadDir, category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return `${category}/${fileName}`;
  }

  deleteFile(category: string, fileName: string): void {
    const filePath = path.join(this.uploadDir, category, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
