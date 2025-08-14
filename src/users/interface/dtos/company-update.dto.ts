import { z } from 'zod';



export const CompanyUpdateSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }).nullable().optional(),
    phone_number: z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, { message: 'Invalid phone number' })
        .nullable()
        .optional(),
    country: z.string().nullable().optional(),
    country_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    street_address: z.string().nullable().optional(),
    zip_code: z.string().nullable().optional(),
    company_name: z
        .string()
        .trim()
        .min(2, { message: 'Company name must be at least 2 characters' })
        .nullable()
        .optional(),
});

export type CompanyUpdateDto = z.infer<typeof CompanyUpdateSchema>;

