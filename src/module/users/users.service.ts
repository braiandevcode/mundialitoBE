import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../../shared/constants/enums';
import { IUser } from '../../shared/contracts/entities';

// Interfaz que representa el usuario devuelto por Firebase tras verificar el token
export interface IFirebaseUser {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  // Busca al usuario por su Firebase UID; si no existe lo crea en DB.
  // Si el uid coincide con ADMIN_UID de .env, asigna role ADMIN automáticamente.
  async findOrCreate(firebaseUser: IFirebaseUser): Promise<IUser> {
    let user = await this.userRepository.findOne({
      where: { id: firebaseUser.uid },
    });

    const adminUid = this.configService.get<string>('env.adminUid');
    const isAdmin = adminUid && firebaseUser.uid === adminUid;

    if (!user) {
      // Primera vez que este usuario Firebase hace una request al backend
      user = this.userRepository.create({
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
        avatar: firebaseUser.avatar,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
      });
      user = await this.userRepository.save(user);
      this.logger.log(`New user created: ${user.email} (role: ${user.role})`);
    } else if (user.role === UserRole.ADMIN && !isAdmin) {
      // Si alguien manipuló la DB y asignó admin a un usuario que no coincide
      // con ADMIN_UID, lo revoco automáticamente en su primer request
      user.role = UserRole.USER;
      await this.userRepository.save(user);
      this.logger.log(`User demoted from ADMIN: ${user.email} (uid not in ADMIN_UID)`);
    } else if (isAdmin && user.role !== UserRole.ADMIN) {
      // Si el uid ahora coincide con ADMIN_UID pero el usuario existía con otro role,
      // lo promuevo a admin (útil si se configuró ADMIN_UID después del primer registro)
      user.role = UserRole.ADMIN;
      await this.userRepository.save(user);
      this.logger.log(`User promoted to ADMIN: ${user.email}`);
    }

    // Actualizo el último login en cada request autenticado
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.toIUser(user);
  }

  // Retorna un usuario por su ID (Firebase UID) o null si no existe
  async findById(id: string): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toIUser(user) : null;
  }

  // Actualiza nombre y/o avatar del perfil del usuario
  async updateProfile(id: string, data: Partial<User>): Promise<IUser | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  // Lista todos los usuarios ordenados por puntos descendente (para admin)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { totalPoints: 'DESC' } });
  }

  // Alias de findById para mantener coherencia semántica
  async findByUid(uid: string): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ where: { id: uid } });
    return user ? this.toIUser(user) : null;
  }

  // Convierte la entidad User al contrato IUser y calcula el rank dinámicamente:
  // rank = posición del usuario en el ranking global según totalPoints
  private async toIUser(user: User): Promise<IUser> {
    const rank = await this.userRepository.count({
      where: { totalPoints: MoreThan(user.totalPoints) },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role as IUser['role'],
      totalPoints: user.totalPoints,
      rank: rank + 1,
    };
  }
}
