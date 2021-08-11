import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

import { getConnection } from 'typeorm';
const gql = String.raw;

jest.mock('mailgun-js', () => {
  const mMailgun = {
    messages: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return jest.fn(() => mMailgun);
});
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
    await app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'shubhs@mail.com';
    it('should create the account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .send({
          query: gql`
            mutation {
              createAccount(
                input: {
                  email: "${EMAIL}"
                  password: "121212"
                  role: Owner
                }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
        });
    });
    it('should fail if the account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .send({
          query: gql`
            mutation {
              createAccount(
                input: {
                  email: "${EMAIL}"
                  password: "121212"
                  role: Owner
                }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
        });
    });
  });
  it.todo('login');
  it.todo('me');
  it.todo('userProfile');
  it.todo('verifyEmail');
  it.todo('updateProfile');
});
