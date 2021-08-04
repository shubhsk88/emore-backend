import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});
const mockJwtRepository = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockMailRepository = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('User Service', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let emailService: MailService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtRepository,
        },
        {
          provide: MailService,
          useValue: mockMailRepository,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    emailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'jkjk',
      password: '!@213',
      role: 0,
    };
    const verificationAccountArgs = {
      code: '123456',
      user: createAccountArgs,
    };
    it('should fail if the user exists', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'abc',
        role: 'A',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error:
          'This email is already register in the system.Please try login instead ',
      });
    });
    it('should create the user successfully', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue(createAccountArgs);
      verificationRepository.save.mockResolvedValue(verificationAccountArgs);
      const result = await service.createAccount(createAccountArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        createAccountArgs,
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on the exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('hello world'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Something went wrong. Please try again',
      });
    });
  });
  describe('login', () => {
    const loginAccountArgs = {
      email: 'abc@email.com',
      password: '12345',
    };
    it(`should fail if the user doesn't exist`,async () => {
      userRepository.findOne.mockResolvedValue(undefined)
      const result = await service.login(loginAccountArgs)
      expect(result).toEqual({ ok: false, error: 'User not found' };)
      
  });
  it('should fail if the password is wrong', () => {
    // userRepository.findOne.mockResolvedValue()


  })
  });
  it.todo('findById');
  it.todo('updateProfile');
  it.todo('verifyEmail');
});
