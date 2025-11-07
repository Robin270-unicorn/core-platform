import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('generateToken')
  generateToken(@Payload() email: string, userId: string) {
    return this.authService.generateToken(email, userId);
  }

  @MessagePattern('hashPassword')
  hashPassword(@Payload() password: string) {
    return this.authService.hashPassword(password);
  }

  @MessagePattern('comparePasswords')
  comparePasswords(@Payload() data: { password: string; hash: string }) {
    return this.authService.comparePasswords(data.password, data.hash);
  }
}
