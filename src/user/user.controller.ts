import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { RequestWithUser } from 'src/auth/entities/auth.entity';

@ApiTags('user')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all user records',
    type: [UserEntity],
  })
  async getAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single user by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Return the user record',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.userService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserEntity })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Updated successfully',
    type: UserEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 403, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async Update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const { userId, role } = req.user;

    return await this.userService.update(id, updateUserDto, userId, role);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    const { userId, role } = req.user;

    return await this.userService.delete(id, userId, role);
  }
}
