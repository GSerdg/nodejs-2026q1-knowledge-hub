import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { convertTimestamp } from 'src/utils/convertTimestamp';
import { PasswordService } from 'src/common/password.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshDto } from './dto/refresh.dto';
import { MyJwtPayload } from './entities/auth.entity';

const select = {
  id: true,
  login: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(user: User) {
    const payload = {
      userId: user.id,
      login: user.login,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const userData = await this.jwtService.verifyAsync<MyJwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      return userData;
    } catch (error) {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }

  async create(dto: SignupDto) {
    try {
      const hashedPassword = await PasswordService.hash(dto.password);

      const user = await this.prisma.user.create({
        data: { ...dto, password: hashedPassword, role: Role.VIEWER },
        select,
      });

      return convertTimestamp(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `User with this login: ${dto.login} already exists`,
          );
        }
      }

      throw error;
    }
  }

  async login(dto: SignupDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: dto.login },
    });

    if (
      !user ||
      !(await PasswordService.compare(dto.password, user.password))
    ) {
      throw new ForbiddenException('Unknown login or password');
    }

    return await this.generateTokens(user);
  }

  async refresh(dto: RefreshDto) {
    if (!dto?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const { login } = await this.verifyRefreshToken(dto.refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new ForbiddenException('Authorization failed');
    }

    return await this.generateTokens(user);
  }
}
