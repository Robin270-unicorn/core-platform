import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../../auth/enums/role.enum';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Email of the user' })
  email: string;

  @Field(() => String, { description: 'Name of the user' })
  name: string;

  @Field(() => String, { description: 'Password of the user' })
  password: string;

  @Field(() => Role, { description: 'Role of the user', nullable: true, defaultValue: Role.SUPPORTER })
  role?: Role;
}
