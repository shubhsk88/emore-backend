import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

import { getConnection } from 'typeorm';
const gql = String.raw;

const GRAPHQL = '/graphql';
describe('UserModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create the account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .send({
          query: `
            mutation {
              createAccount(
                input: {
                  email: "shubhs@mail.com",
                  password: "121212",
                  role: Owner,
                }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200);
    });
  });
  it.todo('login');
  it.todo('me');
  it.todo('userProfile');
  it.todo('verifyEmail');
  it.todo('updateProfile');
});
