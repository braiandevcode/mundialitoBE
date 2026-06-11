import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Prediction } from './prediction.entity';
import { Match } from '../matches/match.entity';
import { User } from '../users/user.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { IPrediction } from '../../shared/contracts/entities';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // DataSource me permite crear QueryRunner para transacciones multi-tabla
    private readonly dataSource: DataSource,
  ) {}

  // Crea o actualiza una predicción (upsert). Si el id ya existe, actualiza
  // conservando el createdAt original. Si no existe, crea un registro nuevo.
  async upsert(dto: CreatePredictionDto): Promise<IPrediction> {
    const match = await this.matchRepository.findOne({
      where: { id: dto.matchId },
    });
    if (!match) throw new NotFoundException('Match not found');

    let prediction = await this.predictionRepository.findOne({
      where: { id: dto.id },
    });

    if (prediction) {
      // Conservo la fecha de creación original en las actualizaciones
      const originalCreatedAt = prediction.createdAt;
      Object.assign(prediction, dto);
      prediction.createdAt = originalCreatedAt;
    } else {
      prediction = this.predictionRepository.create(dto);
    }

    prediction = await this.predictionRepository.save(prediction);
    return this.toIPrediction(prediction, match);
  }

  // Retorna todas las predicciones de un usuario, ordenadas por fecha descendente
  async findByUser(userId: string): Promise<IPrediction[]> {
    const predictions = await this.predictionRepository.find({
      where: { userId },
      relations: { match: true },
      order: { createdAt: 'DESC' },
    });
    return predictions.map((p) => this.toIPrediction(p, p.match));
  }

  // Retorna una predicción específica de un usuario para un partido, o null
  async findByUserAndMatch(
    userId: string,
    matchId: string,
  ): Promise<IPrediction | null> {
    const prediction = await this.predictionRepository.findOne({
      where: { userId, matchId },
      relations: { match: true },
    });
    if (!prediction) return null;
    return this.toIPrediction(prediction, prediction.match);
  }

  // Evalúa todos los pronósticos de un partido finalizado y asigna puntos:
  // - 3 puntos si el marcador exacto es único
  // - 1 punto si el marcador exacto es compartido
  // - 0 puntos si falló el marcador o el ganador de penales
  // Usa transacción para asegurar consistencia entre la tabla predictions y users
  async evaluateMatch(matchId: string): Promise<void> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });
    if (!match || match.status !== 'finished') return;

    // Si el partido no tiene resultado registrado, no puedo evaluar
    if (match.homeScore === null || match.awayScore === null) return;

    const predictions = await this.predictionRepository.find({
      where: { matchId },
    });
    if (predictions.length === 0) return;

    // Transacción: si falla algo intermedio, revierto todo
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Recolecto los userId que acertaron el marcador exacto
      const exactUserIds: string[] = [];

      for (const pred of predictions) {
        const isExact =
          pred.homeScore === match.homeScore &&
          pred.awayScore === match.awayScore;

        if (isExact) {
          // Si el partido tuvo penales, verifico que el usuario también
          // acertó el ganador de la tanda
          if (match.penaltyHomeScore != null && match.penaltyAwayScore != null) {
            const realPenaltyWinner =
              match.penaltyHomeScore > match.penaltyAwayScore
                ? 'home'
                : 'away';

            if (pred.penaltyWinner !== realPenaltyWinner) {
              pred.points = 0;
              await queryRunner.manager.save(pred);
              continue;
            }
          }

          exactUserIds.push(pred.userId);
        }
      }

      // Si solo 1 usuario acertó -> 3 puntos (único), si varios -> 1 punto (compartido)
      const isUnique = exactUserIds.length === 1;
      const points = isUnique ? 3 : 1;

      for (const pred of predictions) {
        const isExact = exactUserIds.includes(pred.userId);

        pred.points = isExact ? points : 0;
        await queryRunner.manager.save(pred);

        // Actualizo los puntos totales del usuario en la tabla users
        if (isExact && pred.points) {
          await queryRunner.manager.increment(
            User,
            { id: pred.userId },
            'totalPoints',
            pred.points,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Obtiene ranking global de usuarios ordenado por puntos totales
  async getGlobalRanking(): Promise<User[]> {
    return this.userRepository.find({
      order: { totalPoints: 'DESC' },
    });
  }

  // Convierte entidad Prediction + Match al contrato IPrediction.
  // Si el partido no ha finalizado, retorno points = null (sin evaluar)
  private toIPrediction(prediction: Prediction, match: Match): IPrediction {
    let points: number | null = prediction.points ?? null;

    if (match.status !== 'finished') {
      points = null;
    }

    return {
      id: prediction.id,
      userId: prediction.userId,
      matchId: prediction.matchId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      extraHomeScore: prediction.extraHomeScore,
      extraAwayScore: prediction.extraAwayScore,
      penaltyWinner: prediction.penaltyWinner as IPrediction['penaltyWinner'],
      points,
      createdAt: prediction.createdAt.toISOString(),
    };
  }
}
