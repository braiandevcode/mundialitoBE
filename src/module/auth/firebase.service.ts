import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.configService.getOrThrow<string>('env.firebase.projectId');
    const clientEmail = this.configService.getOrThrow<string>('env.firebase.clientEmail');
    const privateKey = this.configService.getOrThrow<string>('env.firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not fully configured — Firebase Auth disabled');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized');
    }
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }
}
