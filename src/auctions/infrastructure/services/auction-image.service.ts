import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ApplicationLogger } from 'src/shared/infrastructure/logger/application.logger';

@Injectable()
export class S3Service {
    private s3: S3;
    private readonly bucketName: string;

    constructor(private readonly logger: ApplicationLogger) {
        this.bucketName = process.env.AWS_BUCKET_NAME || '';
        if (!this.bucketName) {
            throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
        }

        this.s3 = new S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        });
    }

    async uploadFiles(
        files: Express.Multer.File[],
        user_id: string,
        auctionId: string,
        imageNames: string[],
    ): Promise<string[]> {
        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            console.log("yo man i'm getting user_id",user_id)
            const file = files[i];
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${imageNames[i]}.${fileExtension}`;
            const key = `auction/uploads/${user_id}/${auctionId}/${fileName}`;

            const params: S3.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            try {
                await this.s3.upload(params).promise();
                const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
                uploadedUrls.push(url);

                this.logger.log(`✅ Uploaded image: ${fileName} to ${url}`);
            } catch (err) {
                this.logger.error(`❌ Failed to upload ${fileName}`, err.stack);
                throw new InternalServerErrorException(`Failed to upload image ${fileName}`);
            }
        }

        return uploadedUrls;
    }

    async deleteFiles(uploadedUrls: string[]): Promise<void> {
        const objects = uploadedUrls.map((url) => {
            const urlObj = new URL(url);
            return { Key: decodeURIComponent(urlObj.pathname.slice(1)) }; // remove leading slash
        });

        const params = {
            Bucket: this.bucketName,
            Delete: {
                Objects: objects,
                Quiet: false,
            },
        };

        try {
            await this.s3.deleteObjects(params).promise();
            this.logger.log(`🧹 Deleted S3 objects: ${JSON.stringify(objects.map(o => o.Key))}`);
        } catch (err) {
            this.logger.error('❌ Failed to delete from S3', err.stack);
            this.logger.error(`Failed to delete this images ${JSON.stringify(uploadedUrls)}`)
        }
    }
}
