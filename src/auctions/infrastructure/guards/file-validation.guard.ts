import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    private readonly maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    transform(files: Express.Multer.File[], _metadata: ArgumentMetadata): Express.Multer.File[] {
        if (!files || !Array.isArray(files) || files.length === 0) {
            throw new BadRequestException('No files provided.');
        }

        for (const file of files) {
            if (!file.size || !file.mimetype) {
                throw new BadRequestException('One or more files are invalid.');
            }

            if (file.size > this.maxSizeInBytes) {
                throw new BadRequestException(`File "${file.originalname}" exceeds the 10MB limit.`);
            }

            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException(
                    `File "${file.originalname}" has an invalid type. Only PNG, JPG, and JPEG are allowed.`,
                );
            }
        }

        return files;
    }
}
