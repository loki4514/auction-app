import { z } from "zod";
import * as moment from "moment-timezone";
import { auction_status, auction_type, currency, product_type } from "@prisma/client";


export const AuctionUpdateDetailsSchema = z.object({
    auction_name: z
        .string()
        .min(3, { message: "Auction name must be at least 3 characters long." }).optional(),

    auction_details: z
        .string()
        .optional(),

    auction_product_type: z
        .nativeEnum(product_type, {
            errorMap: () => ({ message: `Invalid product type selected. }` }),
        }).optional(),

    max_participants: z
        .number()
        .int({ message: "Max participants must be an integer." })
        .positive({ message: "Max participants must be a positive number." }),

    min_bid_amount: z
        .number()
        .positive({ message: "Minimum bid amount must be a positive number." }),

    bid_increment: z
        .number()
        .positive({ message: "Bid increment must be a positive number." }).optional(),

    currency: z
        .nativeEnum(currency, {
            errorMap: () => ({ message: "Invalid currency provided." }),
        }).optional(),

    auction_status: z
        .nativeEnum(auction_status, {
            errorMap: () => ({ message: "Invalid auction status provided." }),
        }).optional(),

    auction_type: z
        .nativeEnum(auction_type, {
            errorMap: () => ({ message: "Invalid auction type provided." }),
        }).optional(),

    auction_start_time: z
        .preprocess((val) => new Date(val as string), z.date())
        .refine((date) => {
            const now = moment().tz("UTC");
            const startTime = moment(date);
            return startTime.diff(now, "hours") >= 1;
        }, { message: "Auction start time must be at least 1 hours from now." }).optional(),

        auction_end_time: z
        .preprocess((val) => (val === null || val === undefined ? undefined : new Date(val as string)), z.date().optional())
        .refine((date) => {
            if (!date) return true; // ✅ If no end time is given, allow it (optional)
            const now = moment().tz("UTC");
            const endTime = moment(date);
            return endTime.isAfter(now); // ❌ If provided, it must be in the future
        }, { message: "Auction end time must be a future date." }),

});

export type AuctionUpdateDetailsDto = z.infer<typeof AuctionUpdateDetailsSchema>;
