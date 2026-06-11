import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const MATCH_ID_REGEX = /^(?:[A-L][1-6]|R(?:32-(?:1[0-6]|[1-9])|16-[1-8]|QF-[1-4]|SF-[12])|FINAL|3RD)$/;

@Injectable()
export class ParseMatchIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!MATCH_ID_REGEX.test(value)) {
      throw new BadRequestException(
        `Invalid matchId format "${value}". Expected format: group (A1–L6), KO (R32-1…R32-16, R16-1…R16-8, QF-1…QF-4, SF-1…SF-2), FINAL or 3RD`,
      );
    }
    return value;
  }
}
