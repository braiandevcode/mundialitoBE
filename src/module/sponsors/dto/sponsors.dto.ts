import { IsString, IsUrl, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  name!: string;

  @IsUrl()
  bannerUrl!: string;

  @IsUrl()
  linkUrl!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateSponsorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @IsUrl()
  @IsOptional()
  linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
