import { z } from 'zod';

export const CreateUserSchema = z.object({
    first_name: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty'),
    last_name: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty'),
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    user_role: z.enum(['bidder', 'auctioneer', 'admin']).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
