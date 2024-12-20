import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { plainToClass } from 'class-transformer';
import { CrudService } from 'src/core/services/crud-service.interface';
import { AbstractCrudService } from 'src/core/services/abstract-crud.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import {
  JsonResponse,
  successResponse,
} from 'src/common/helpers/json-response.helper';

@Injectable()
export class UsersService
  extends AbstractCrudService<User, UserDto, CreateUserDto, UpdateUserDto>
  implements CrudService<User, UserDto, CreateUserDto, UpdateUserDto>
{
  /**
   * The name of the entity, used for generating dynamic messages and responses.
   */
  entityName: string = 'User';

  /**
   * Converts an user or a list of users to their corresponding Data Transfer Object (DTO) representation.
   *
   * @param {User | User[]} user - The user or list of users to be converted to DTO(s).
   * @returns {any} - The DTO or list of DTOs corresponding to the provided user/users.
   */
  convertToDto(user: User | User[]): any {
    return plainToClass(UserDto, user);
  }

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<JsonResponse<UserDto>> {
    const entity = await this.repository.findOne({ where: { email } as any });
    return successResponse(
      this.convertToDto(entity),
      `${this.entityName} retrieved successfully`,
    );
  }
}
