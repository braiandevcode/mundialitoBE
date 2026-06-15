import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../../module/auth/firebase.service';
import { UsersService } from '../../module/users/users.service';
import type { IUser } from '../../shared/contracts/entities';

// Extiendo la interfaz Request de Express para incluir el usuario autenticado
interface AuthenticatedRequest extends Request {
  user: IUser;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  // Verifica el token JWT de Firebase, busca o crea el usuario en DB,
  // y setea request.user con los datos del usuario para uso en controllers
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!this.firebaseService.isEnabled()) {
      throw new UnauthorizedException('Firebase auth is not configured');
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.firebaseService.auth.verifyIdToken(token);
      const firebaseUser = {
        uid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        avatar: decoded.picture || undefined,
      };

      // findOrCreate: si es su primera request, se crea el usuario en DB automáticamente
      const dbUser = await this.usersService.findOrCreate(firebaseUser);

      // Adjunto el usuario IUser completo al request para que los controllers
      // puedan usar @CurrentUser() con typing estricto
      request.user = dbUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
