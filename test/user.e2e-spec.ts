import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
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
  let userRepository: Repository<User>;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
  describe('login', () => {
    it('should return the token for the user if logged in', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .send({
          query: gql`
            mutation {
              login(input: { email: "shubhs@mail.com", password: "121212" }) {
                ok
                token
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          token = res.body.data.login.token;
          expect(res.body.data.login.ok).toBe(true);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          expect(res.body.data.login.error).toBe(null);
        });
    });
    it('should return the errror if the user doesnt exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .send({
          query: gql`
            mutation {
              login(input: { email: "shubh@mail.com", password: "121212" }) {
                ok
                token
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.token).toEqual(null);
          expect(res.body.data.login.error).toEqual(expect.any(String));
        });
    });
  });
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      userId = user.id;
    });
    it('should show the user if exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .set('X-JWT', token)
        .send({
          query: gql`
            {
              userProfile(data: { userId: ${userId} }) {
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('should return false if user not exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL)
        .set('X-JWT', token)
        .send({
          query: gql`
            {
              userProfile(data: { userId: 55 }) {
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          // console.log(res.body);
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toEqual(expect.any(String));
          expect(user).toBe(null);
        });
    });
  });
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('updateProfile');
});
