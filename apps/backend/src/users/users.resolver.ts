import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UsersService) {}

    @Query(() => String)
    async hello(): Promise<string> {
        return 'Hello World!';
    }

    @Mutation(() => User)
    async createUser(
        @Args('email') email: string,
        @Args('name') name: string,
        @Args('password') password: string,
    ): Promise<User> {
        return this.userService.create({ email, name, password });
    }

    @Mutation(() => String)
    async login(
        @Args('email') email: string,
        @Args('password') password: string,
    ): Promise<string> {
        return this.userService.login(email, password);
    }
}