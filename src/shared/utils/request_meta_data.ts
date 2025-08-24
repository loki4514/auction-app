import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { RequestMetaDta } from '../types/request_meta.types';

@Injectable()
export class RequestInfoService {
    async extractRequestInfo(req: Request): Promise<RequestMetaDta> {
        // 1. Extract IP
        const forwarded = (req.headers['x-forwarded-for'] as string) || '';
        const ip = (forwarded.split(',')[0] || req.socket.remoteAddress || '').replace('::ffff:', '');

        // 2. Extract User-Agent
        const userAgent = (req.headers['user-agent'] as string) || 'unknown';

        // 3. Lookup location
        let location : any = null;

        // Only fetch location if IP is not local
        if (ip && ip !== '127.0.0.1' && ip !== '::1') {
            try {
                const { data } = await axios.get(
                    `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,query`
                );
                if (data?.status === 'success') {
                    location = data;
                }
            } catch {
                location = { error: 'Unable to fetch location' };
            }
        }

        // 4. Return clean object
        return {
            ip,
            userAgent,
            location,
        };
    }
}
