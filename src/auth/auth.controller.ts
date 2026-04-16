import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { TokensResponseDto } from './entities/auth.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Signup user' })
  @ApiResponse({
    status: 201,
    description: 'Signup user ',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  async signup(@Body() userData: SignupDto) {
    return await this.authService.create(userData);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User is logged in',
    type: TokensResponseDto,
  })
  @ApiResponse({ status: 400, description: 'BadRequestException' })
  @ApiResponse({
    status: 403,
    description: 'No user with such login, password',
  })
  async login(@Body() userData: SignupDto) {
    return await this.authService.login(userData);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New token created',
    type: TokensResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No refreshToken in body' })
  @ApiResponse({
    status: 403,
    description: 'Refresh token is invalid or expired',
  })
  async refresh(@Body() data: RefreshDto) {
    return await this.authService.refresh(data);
  }
}
