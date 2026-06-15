import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.configService.get<string>('env.firebase.projectId') || '';
    const clientEmail = this.configService.get<string>('env.firebase.clientEmail') || '';
    const privateKey = this.configService.get<string>('env.firebase.privateKey') || '';

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not fully configured - Firebase Auth disabled');
      return;
    }

    if (!admin.apps.length) {
      this.logger.log('Inicializando Firebase Admin SDK...');
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin SDK initialized');
      } catch (err) {
        this.logger.error('Error inicializando Firebase Admin SDK:', err);
      }
    }
  }

  isEnabled(): boolean {
    return admin.apps.length > 0;
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }
}
