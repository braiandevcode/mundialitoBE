import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../shared/constants/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
