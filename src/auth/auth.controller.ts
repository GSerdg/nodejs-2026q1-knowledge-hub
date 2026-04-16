import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth/signup')
@Controller('auth/signup')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Signup user' })
  @ApiResponse({ status: 201, description: 'Signup user ', type: SignupDto })
  @ApiResponse({ status: 400, description: 'Unknown login or password' })
  async signup(@Body() userData: SignupDto) {
    return await this.authService.create(userData);
  }

  @Public()
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

  @Public()
  @Post()
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New token created',
    type: RefreshDto,
  })
  @ApiResponse({ status: 400, description: 'Unknown login or password' })
  async refresh(@Body() data: RefreshDto) {
    return await this.authService.refresh(data);
  }
}
