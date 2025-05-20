import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose'; // MongoDB ObjectId 유효성 검사를 위해 Mongoose의 Types를 사용

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  /**
   * 입력된 문자열 값이 유효한 MongoDB ObjectId인지 검사합니다.
   * 유효하지 않으면 BadRequestException을 발생시킵니다.
   * 유효하면 원래 문자열 값을 그대로 반환합니다.
   * (필요에 따라 Types.ObjectId 인스턴스로 변환하여 반환할 수도 있습니다.)
   *
   * @param value 검사할 문자열 값 (예: 라우트 매개변수)
   * @param metadata 매개변수에 대한 메타데이터 (사용하지 않음)
   * @returns 유효한 ObjectId 문자열
   * @throws BadRequestException 유효하지 않은 ObjectId 형식일 경우
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(
        `'${value}' is not a valid MongoDB ObjectId`,
      );
    }
    // 유효하다면, 원래 문자열 값을 그대로 반환합니다.
    // 만약 서비스 레이어에서 Types.ObjectId 객체를 직접 사용하고 싶다면,
    // 여기서 return new Types.ObjectId(value); 와 같이 변환할 수도 있습니다.
    // 하지만 일반적으로는 문자열 ID를 그대로 사용하는 경우가 많습니다.
    return value;
  }
}
