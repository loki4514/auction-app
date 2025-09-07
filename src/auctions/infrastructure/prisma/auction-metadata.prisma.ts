import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/infrastructure/database/prisma/prisma.service";
import { ApplicationLogger } from "src/shared/infrastructure/logger/application.logger";
import { IAuctionMetadataRepository } from "src/auctions/domain/repository/auction-metadata.repository";
import { AuctionMetadataResponse, CreateAuctionMetadataDto, GetAuctionMetadataFilters, RepositoryResponse, clientLocation } from "src/auctions/domain/entity/auction-metadata.entity";

@Injectable()
export class AuctionMetadataRepository extends IAuctionMetadataRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: ApplicationLogger
    ) {
        super();
    }

    async createAuctionMetadata(data: CreateAuctionMetadataDto): Promise<RepositoryResponse<AuctionMetadataResponse | null>> {
        try {
            // First check if auction exists
            const auctionExists = await this.prisma.auction.findUnique({
                where: { auction_id: data.auction_id },
                select: { auction_id: true },
            });

            if (!auctionExists) {
                return {
                    status: 404,
                    data: null,
                };
            }

            const metadata = await this.prisma.auction_metadata.create({
                data: {
                    auction_id: data.auction_id,
                    ip_address: data.ip_address,
                    user_agent: data.user_agent,
                    device: data.device,
                    os: data.os,
                    location: data.location ? data.location as any : undefined,
                },
            });

            return {
                status: 201,
                data: metadata as AuctionMetadataResponse,
            };
        } catch (error) {
            this.logger.error(`Error creating auction metadata: ${error?.message}`, error.stack);
            return {
                status: 500,
                data: null,
            };
        }
    }

    async getAuctionMetadataById(id: string): Promise<RepositoryResponse<AuctionMetadataResponse | null>> {
        try {
            const metadata = await this.prisma.auction_metadata.findUnique({
                where: { id },
                include: {
                    auction: {
                        select: {
                            auction_id: true,
                            auction_name: true,
                        },
                    },
                },
            });

            if (!metadata) {
                return {
                    status: 404,
                    data: null,
                };
            }

            return {
                status: 200,
                data: metadata as AuctionMetadataResponse,
            };
        } catch (error) {
            this.logger.error(`Error fetching auction metadata by ID: ${error?.message}`, error.stack);
            return {
                status: 500,
                data: null,
            };
        }
    }

    async getAuctionMetadataByAuctionId(auction_id: string): Promise<RepositoryResponse<AuctionMetadataResponse[] | null>> {
        try {
            const metadata = await this.prisma.auction_metadata.findMany({
                where: { auction_id },
                orderBy: { created_at: 'desc' },
            });

            return {
                status: 200,
                data: metadata as AuctionMetadataResponse[],
            };
        } catch (error) {
            this.logger.error(`Error fetching auction metadata by auction ID: ${error?.message}`, error.stack);
            return {
                status: 500,
                data: null,
            };
        }
    }

    async getAllAuctionMetadata(filters?: GetAuctionMetadataFilters): Promise<RepositoryResponse<AuctionMetadataResponse[] | null>> {
        try {
            const whereConditions: any = {};

            if (filters) {
                if (filters.auction_id) {
                    whereConditions.auction_id = filters.auction_id;
                }
                if (filters.ip_address) {
                    whereConditions.ip_address = filters.ip_address;
                }
                if (filters.device) {
                    whereConditions.device = filters.device;
                }
                if (filters.os) {
                    whereConditions.os = filters.os;
                }
                if (filters.created_from || filters.created_to) {
                    whereConditions.created_at = {};
                    if (filters.created_from) {
                        whereConditions.created_at.gte = filters.created_from;
                    }
                    if (filters.created_to) {
                        whereConditions.created_at.lte = filters.created_to;
                    }
                }
            }

            const metadata = await this.prisma.auction_metadata.findMany({
                where: whereConditions,
                orderBy: { created_at: 'desc' },
                include: {
                    auction: {
                        select: {
                            auction_id: true,
                            auction_name: true,
                        },
                    },
                },
            });

            return {
                status: 200,
                data: metadata as AuctionMetadataResponse[],
            };
        } catch (error) {
            this.logger.error(`Error fetching all auction metadata: ${error?.message}`, error.stack);
            return {
                status: 500,
                data: null,
            };
        }
    }

    // async updateAuctionMetadata(id: string, data: Partial<CreateAuctionMetadataDto>): Promise<RepositoryResponse<AuctionMetadataResponse>> {
    //     try {
    //         // Check if metadata exists
    //         const existingMetadata = await this.prisma.auction_metadata.findUnique({
    //             where: { id },
    //         });

    //         if (!existingMetadata) {
    //             return {
    //                 success: false,
    //                 status: 404,
    //                 message: "Auction metadata not found",
    //                 data: null,
    //             };
    //         }

    //         const updatedMetadata = await this.prisma.auction_metadata.update({
    //             where: { id },
    //             data: {
    //                 ip_address: data.ip_address,
    //                 user_agent: data.user_agent,
    //                 device: data.device,
    //                 os: data.os,
    //                 location: data.location,
    //             },
    //         });

    //         return {
    //             success: true,
    //             status: 200,
    //             message: "Auction metadata updated successfully",
    //             data: updatedMetadata,
    //         };
    //     } catch (error) {
    //         this.logger.error(`Error updating auction metadata: ${error?.message}`, error.stack);
    //         return {
    //             success: false,
    //             status: 500,
    //             message: "Error occurred while updating auction metadata",
    //             data: null,
    //         };
    //     }
    // }

    // async deleteAuctionMetadata(id: string): Promise<RepositoryResponse<boolean>> {
    //     try {
    //         // Check if metadata exists
    //         const existingMetadata = await this.prisma.auction_metadata.findUnique({
    //             where: { id },
    //         });

    //         if (!existingMetadata) {
    //             return {
    //                 success: false,
    //                 status: 404,
    //                 message: "Auction metadata not found",
    //                 data: false,
    //             };
    //         }

    //         await this.prisma.auction_metadata.delete({
    //             where: { id },
    //         });

    //         return {
    //             success: true,
    //             status: 200,
    //             message: "Auction metadata deleted successfully",
    //             data: true,
    //         };
    //     } catch (error) {
    //         this.logger.error(`Error deleting auction metadata: ${error?.message}`, error.stack);
    //         return {
    //             success: false,
    //             status: 500,
    //             message: "Error occurred while deleting auction metadata",
    //             data: false,
    //         };
    //     }
    // }

    async getMetadataAnalytics(auction_id: string): Promise<RepositoryResponse<{
        total_views: number;
        unique_ips: number;
        device_breakdown: Record<string, number>;
        os_breakdown: Record<string, number>;
        location_breakdown: Record<string, number>;
    } | null>> {
        try {
            // Check if auction exists
            const auctionExists = await this.prisma.auction.findUnique({
                where: { auction_id },
                select: { auction_id: true },
            });

            if (!auctionExists) {
                return {
                    status: 404,
                    data: null,
                };
            }

            const metadata = await this.prisma.auction_metadata.findMany({
                where: { auction_id },
                select: {
                    ip_address: true,
                    device: true,
                    os: true,
                    location: true,
                },
            });

            const totalViews = metadata.length;
            const uniqueIps = new Set(metadata.filter(m => m.ip_address).map(m => m.ip_address)).size;

            // Device breakdown
            const deviceBreakdown: Record<string, number> = {};
            metadata.forEach(m => {
                if (m.device) {
                    deviceBreakdown[m.device] = (deviceBreakdown[m.device] || 0) + 1;
                }
            });

            // OS breakdown
            const osBreakdown: Record<string, number> = {};
            metadata.forEach(m => {
                if (m.os) {
                    osBreakdown[m.os] = (osBreakdown[m.os] || 0) + 1;
                }
            });

            // Location breakdown - Fixed the logic here
            const locationBreakdown: Record<string, number> = {};
            metadata.forEach(m => {
                if (m.location && typeof m.location === "object" && !Array.isArray(m.location)) {
                    const locationData = m.location as unknown as clientLocation;
                    if (locationData.country) {
                        const country = locationData.country;
                        locationBreakdown[country] = (locationBreakdown[country] || 0) + 1;
                    }
                }

            });

            const analytics = {
                total_views: totalViews,
                unique_ips: uniqueIps,
                device_breakdown: deviceBreakdown,
                os_breakdown: osBreakdown,
                location_breakdown: locationBreakdown,
            };

            return {
                status: 200,
                data: analytics,
            };
        } catch (error) {
            this.logger.error(`Error fetching auction metadata analytics: ${error?.message}`, error.stack);
            return {
                status: 500,
                data: null,
            };
        }
    }
}