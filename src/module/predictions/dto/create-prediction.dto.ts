import {
  IsString,
  IsInt,
  IsOptional,
  IsIn,
  Min,
  Matches,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

const MATCH_ID_REGEX =
  /^(?:[A-L][1-6]|R(?:32-(?:1[0-6]|[1-9])|16-[1-8]|QF-[1-4]|SF-[12])|FINAL|3RD)$/;

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString({ message: 'userId usuario no valido' })
  userId!: string;

  @Matches(MATCH_ID_REGEX, { message: 'MatchId no valido' })
  matchId!: string;

  @IsInt({ message: 'homeScore debe ser un entero' })
  @Min(0)
  homeScore!: number;

  @IsInt({ message: 'awayScore debe ser un número' })
  @Min(0)
  awayScore!: number;

  @IsInt({ message: 'extraHomeScore debe ser un numero' })
  @Min(0)
  @IsOptional()
  extraHomeScore?: number;

  @IsInt({ message: 'extraAwayScore debe ser un número' })
  @Min(0)
  @IsOptional()
  extraAwayScore?: number;

  @IsInt({ message: 'points debe ser un numero' })
  @Min(0)
  @IsOptional()
  points?: number;

  @IsString()
  @IsIn(['home', 'away'], {
    message: 'penaltyWinner solo puede ser casa o visitante',
  })
  @IsOptional()
  penaltyWinner?: string;
}
