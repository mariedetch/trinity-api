import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { plainToClass } from 'class-transformer';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { Addresses } from '../users/dto/addresses.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  convertToDto(user: User | User[]): any {
    return plainToClass(UserDto, user);
  }

  async getProfile(id: string): Promise<JsonResponse<UserDto>> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      return successResponse(
        plainToClass(UserDto, user.data),
        `Profile successfully gotten`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getProfileAddresses(id: string): Promise<JsonResponse<Addresses[]>> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      return successResponse(
        user.data.addresses,
        `Addresse successfully gotten`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async createProfileAddresses(
    id: string,
    addresse: Addresses,
  ): Promise<JsonResponse<Addresses[]>> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      user.data.addresses.push(addresse);
      await this.repository.save(user.data);

      return successResponse(
        user.data.addresses,
        `Addresse successfully created`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async updateProfileAddresses(
    id: string,
    addresse: Addresses,
    addressId: string,
  ): Promise<JsonResponse<Addresses[]>> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      const address = user.data.addresses.find(
        (address) => address.id === addressId,
      );
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      Object.assign(address, addresse);

      await this.repository.save(user.data);

      return successResponse(
        user.data.addresses,
        `Addresse successfully updated`,
        200,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async deleteProfileAddresses(
    id: string,
    addressId: string,
  ): Promise<JsonResponse<Addresses[]>> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Not found');
      }

      const address = user.data.addresses.findIndex(
        (address) => address.id === addressId,
      );
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      user.data.addresses.splice(address, 1);

      await this.repository.save(user.data);

      return successResponse(null, `Addresse successfully deleted`, 200);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
