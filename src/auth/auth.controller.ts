import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';

@ApiTags('auth/signup')
@Controller('auth/signup')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Signup user' })
  @ApiResponse({ status: 201, description: 'Signup user ', type: SignupDto })
  @ApiResponse({ status: 400, description: 'Unknown login or password' })
  async signup(@Body() userData: SignupDto) {
    return await this.authService.create(userData);
  }

  @Post()
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User is logged in',
    type: SignupDto,
  })
  @ApiResponse({ status: 400, description: 'Unknown login or password' })
  async login(@Body() userData: SignupDto) {
    return await this.authService.login(userData);
  }
}
