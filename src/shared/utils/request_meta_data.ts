import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { RequestMetaData } from '../types/request_meta.types';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class RequestInfoService {
    async extractRequestInfo(req: Request): Promise<RequestMetaData> {
        // 1. Extract IP
        const forwarded = (req.headers['x-forwarded-for'] as string) || '';
        const ip = (forwarded.split(',')[0] || req.socket.remoteAddress || '').replace('::ffff:', '');

        // 2. Extract User-Agent
        const userAgent = (req.headers['user-agent'] as string) || 'unknown';

        // 3. Parse device + OS from User-Agent
        let device: string | null = null;
        let os: string | null = null;
        
        if (userAgent !== 'unknown') {
            const parser = new UAParser(userAgent);
            const deviceInfo = parser.getDevice();
            const osInfo = parser.getOS();

            // Better device detection
            if (deviceInfo.model) {
                device = deviceInfo.model;
            } else if (deviceInfo.vendor) {
                device = `${deviceInfo.vendor} ${deviceInfo.type || 'device'}`.trim();
            } else if (deviceInfo.type) {
                device = deviceInfo.type;
            } else {
                // Fallback detection based on user agent
                const ua = userAgent.toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                    device = 'mobile';
                } else if (ua.includes('tablet') || ua.includes('ipad')) {
                    device = 'tablet';
                } else {
                    device = 'desktop';
                }
            }

            // Better OS detection
            if (osInfo.name) {
                os = osInfo.version 
                    ? `${osInfo.name} ${osInfo.version}` 
                    : osInfo.name;
            }
        }

        // 4. Lookup location
        let location: any = null;
        if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
            try {
                const { data } = await axios.get(
                    `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,query`,
                    { timeout: 5000 } // Add timeout to prevent hanging
                );
                if (data?.status === 'success') {
                    location = {
                        country: data.country,
                        region: data.regionName,
                        city: data.city,
                        ip: data.query
                    };
                }
            } catch (error) {
                location = { error: 'Unable to fetch location' };
            }
        }

        // 5. Return clean object
        return {
            ip,
            userAgent,
            device,
            os,
            location,
        };
    }
}