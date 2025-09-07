import { accounts, AccountStatus } from '@prisma/client';
import { AccountEntity , UpdateAccountDTO} from 'src/users/domain/entity/account.entity';


export class AccountMappers {
    static fromORM(prismaAccount: accounts | null): AccountEntity | null {
        if (!prismaAccount) return null;

        return {
            account_id: prismaAccount.account_id,
            company_name: prismaAccount.company_name,
            created_at: prismaAccount.created_at,
            current_plan_id: prismaAccount.current_plan_id,
            is_used_free_plan: prismaAccount.is_used_free_plan,
            account_type: prismaAccount.account_type as 'bidder' | 'auctioneer',
            account_status : prismaAccount.account_status,

            email: prismaAccount.email,
            phone_number: prismaAccount.phone_number,
            country: prismaAccount.country,
            country_code: prismaAccount.country_code,
            city: prismaAccount.city,
            state: prismaAccount.state,
            street_address: prismaAccount.street_address,
            zip_code: prismaAccount.zip_code,
        };
    }

    static toPartialORM(dto: UpdateAccountDTO): Partial<accounts> {
        const ormData: Partial<accounts> = {};

        if (dto.company_name != null) ormData.company_name = dto.company_name;
        if (dto.current_plan_id != null) ormData.current_plan_id = dto.current_plan_id;
        if (dto.is_used_free_plan != null) ormData.is_used_free_plan = dto.is_used_free_plan;
        if (dto.account_type != null) ormData.account_type = dto.account_type;

        if (dto.email != null) ormData.email = dto.email;
        if (dto.phone_number != null) ormData.phone_number = dto.phone_number;
        if (dto.country != null) ormData.country = dto.country;
        if (dto.country_code != null) ormData.country_code = dto.country_code;
        if (dto.city != null) ormData.city = dto.city;
        if (dto.state != null) ormData.state = dto.state;
        if (dto.street_address != null) ormData.street_address = dto.street_address;
        if (dto.zip_code != null) ormData.zip_code = dto.zip_code;

        ormData.updated_at = new Date();

        return ormData;
    }
}
