import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInput } from './dto/create-user.input';
import { firstValueFrom } from 'rxjs';

// temporary user store for demo
interface StoredUser {
  email: string;
  name: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private users = new Map<string, StoredUser>();

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const { email, name, password } = createUserInput;
    if (this.users.has(email)) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await firstValueFrom(
      this.authClient.send<string>('hashPassword', password)
    );

    const user: StoredUser = { email, name, passwordHash };
    this.users.set(email, user);

    return `User ${email} created`;
  }

  async login(email: string, password: string) {
    const user = this.users.get(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await firstValueFrom(
      this.authClient.send<boolean>('comparePasswords', { password, hash: user.passwordHash })
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return firstValueFrom(
      this.authClient.send<string>('generateToken', email)
    );
  }
}
