import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailService } from './mail.service';


describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { apiKey: 'lalasas', domain: 'lalasas', email: 'lalasas' },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
