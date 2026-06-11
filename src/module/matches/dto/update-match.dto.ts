import { IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { MatchStatus } from '../../../shared/constants/enums';

export class UpdateMatchDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  homeScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  awayScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  extraHomeScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  extraAwayScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  penaltyHomeScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  penaltyAwayScore?: number;

  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;
}
