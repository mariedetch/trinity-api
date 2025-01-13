import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/features/users/enum';
import { ROLES_KEY } from '../utils/constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
