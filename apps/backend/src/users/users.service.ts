import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput } from './dto/create-user.input';
import { firstValueFrom } from 'rxjs';
import {Repository} from "typeorm";
import {User} from "./entities/user.entity";


@Injectable()
export class UsersService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_REPOSITORY') private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const { email, name, password } = createUserInput;
    const exists = await this.userRepository.findOne({where: {email}});
    if (exists) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await firstValueFrom(
      this.authClient.send<string>('hashPassword', password)
    );

    const user = this.userRepository.create({email, name, password: passwordHash});
    return this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({where: {email}});
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await firstValueFrom(
      this.authClient.send<boolean>('comparePasswords', { password, hash: user.password })
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return firstValueFrom(
      this.authClient.send<string>('generateToken', {email, userId: user.id})
    );
  }
}
