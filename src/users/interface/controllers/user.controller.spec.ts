import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from 'src/users/application/use-cases/create-user.use-case';

describe('UserController', () => {
    let controller: UserController;

    const mockCreateUserUseCase = {
        execute: jest.fn(), // fake method we can spy on later
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [CreateUserUseCase], // we override this
        })
            .overrideProvider(CreateUserUseCase)
            .useValue(mockCreateUserUseCase)
            .compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call create user use case', async () => {
        const mockDto = {
            email: 'test@example.com',
            password: '123456',
            first_name: 'Test',
            last_name: 'User',
        };

        mockCreateUserUseCase.execute.mockResolvedValue({
            success: true,
            message: 'Created',
            status: 201,
        });

        const res = await controller.createUser(mockDto);
        expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(mockDto);
        expect(res).toEqual({
            success: true,
            message: 'Created',
            status: 201,
        });
    });
});
