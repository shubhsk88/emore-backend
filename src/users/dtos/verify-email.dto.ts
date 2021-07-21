import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/mutation.dto';
import { User } from '../entities/user.entity';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerifyEmailnput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyOutput extends MutationOutput {}
