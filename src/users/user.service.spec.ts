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
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
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
  let jwtService: JwtService;

  beforeEach(async () => {
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
    jwtService = module.get<JwtService>(JwtService);
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
    it(`should fail if the user doesn't exist`, async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginAccountArgs);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: 'The username or password is wrong',
      });
      // userRepository.findOne.mockResolvedValue()
    });
    it('should return the token', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      const token = '123';
      mockJwtRepository.sign.mockReturnValue(token);
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginAccountArgs);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: true, token });
    });
    it('should fail on the exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('hello world'));
      const result = await service.login(loginAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Something went wrong',
      });
    });
  });
  describe('findById', () => {
    const user = { id: '1', role: 'abc', username: 'Hello' };
    it('should return the user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(user);
      const result = await service.findById(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, user });
    });
    it('should not fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error(''));
      const result = await service.findById(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: "User doesn't exist" });
    });
  });
  describe('updateProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'user@abc.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'abc@mail.com' },
      };
      const newUser = {
        email: 'abc@mail.com',
        verified: false,
      };
      const verification = {
        code: 'abc',
        user: newUser,
      };
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(verification);
      verificationRepository.save.mockResolvedValue(verification);
      const result = await service.updateProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(verification);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        verification.code,
        newUser.email,
      );
    });
    it('should change password', async () => {
      const oldUser = {
        email: 'user@abc.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { password: 'abcd' },
      };
      const newUser = {
        email: 'user@abc.com',
        password: 'abcd',
        verified: true,
      };
      const verification = {
        code: 'abc',
        user: newUser,
      };
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(verification);
      verificationRepository.save.mockResolvedValue(verification);
      const result = await service.updateProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({ ok: true });
    });
    it('should return on exception', async () => {
      const oldUser = {
        email: 'user@abc.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { password: 'abcd' },
      };
      userRepository.findOne.mockRejectedValue(new Error('hello'));
      const result = await service.updateProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(result).toEqual({ ok: false, error: 'Something went wrong' });
    });
  });
  describe('verifyEmail', () => {
    it('Should verify the user', async () => {
      const oldUser = {
        email: 'user@abc.com',
        verified: false,
      };
      const verification = {
        code: 'abc',
        id: 1,
        user: oldUser,
      };
      verificationRepository.findOneOrFail.mockResolvedValue(verification);

      const result = await service.verifyEmail({ code: 'abc' });
      expect(verificationRepository.findOneOrFail).toBeCalledWith(
        {
          code: verification.code,
        },
        {
          relations: ['user'],
        },
      );

      expect(userRepository.save).toHaveBeenCalledWith(verification.user);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        verification.id,
      );
      expect(result).toEqual({ ok: true });
    });
    it('should return false on exception', async () => {
      const oldUser = {
        email: 'user@abc.com',
        verified: true,
      };
      const verification = {
        code: 'abc',
        id: 1,
        user: oldUser,
      };

      verificationRepository.findOneOrFail.mockRejectedValue(
        new Error('hello'),
      );
      const result = await service.verifyEmail({ code: 'abc' });
      expect(verificationRepository.findOneOrFail).toBeCalledWith(
        {
          code: verification.code,
        },
        {
          relations: ['user'],
        },
      );
      expect(result).toEqual({
        ok: false,
        error: 'The verification code is incorrect',
      });
    });
  });
});
