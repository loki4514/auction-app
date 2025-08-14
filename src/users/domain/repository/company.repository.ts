import { AccountEntity, UpdateAccountDTO } from "../entity/account.entity";

export abstract class ICompanyRepository {
    abstract addedCompnay(): Promise<{ account_id: string | null }>;

    abstract findByCompanyPhoneNumber(phone_number: string): Promise<{
        status?: number;
        data?: AccountEntity | null;
    }>;

    abstract findByCompanyEmail(email: string): Promise<{
        status?: number;
        data?: AccountEntity | null;
    }>;

    abstract updateCompany(company_details: UpdateAccountDTO): Promise<void>;

    abstract becomeAuctioneer(account_id : string, user_id : string) : Promise<boolean>;

}
