import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async getPreferences(userId: string) {
    const preference = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (!preference) throw new NotFoundException('Preferences not found');
    return preference;
  }

  updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreference.update({ where: { userId }, data: dto });
  }
}
