import { PartialType } from '@nestjs/swagger'; // 또는 @nestjs/mapped-types
import { CreateEventDto } from './create-event.dto';

// PartialType을 사용하면 CreateEventDto의 모든 필드를 선택적으로 만들 수 있습니다.
export class UpdateEventDto extends PartialType(CreateEventDto) {}