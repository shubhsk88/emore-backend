import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { JwtService } from './jwt.service';

const TEST_KEY = 'abc';
const TOKEN = 'TOKEN';
const id = 1;
jest.mock('jsonwebtoken', () => {
  return { sign: jest.fn(() => TOKEN), verify: jest.fn(() => ({ id })) };
});
describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return the sign token', () => {
      const token = service.sign(id);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id }, TEST_KEY);
    });
  });
  describe('verify', () => {
    it('should verify the token', () => {
      const decodedToken = service.verify(TOKEN);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(decodedToken).toEqual({ id });
    });
  });
});
