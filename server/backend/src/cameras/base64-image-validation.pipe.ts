import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ImageBuffer, imageBufferFromBuffer } from './image-buffer';

/**
 * Verifies that the given set of fields contain a base64-encoded image and transforms them
 * into Buffer objects.
 */
@Injectable()
export class Base64ImageValidationPipe
  implements PipeTransform<any, ImageBuffer>
{
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      console.error(
        `Expected a string value in Base64ImageValidationPipe, got ${value}`,
      );
      throw new BadRequestException(
        `Expected param "${metadata.data}" to be a base64-encoded image.`,
      );
    }
    try {
      return imageBufferFromBuffer(Buffer.from(value, 'base64'));
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `Expected param "${metadata.data}" to be a base64-encoded image.`,
      );
    }
  }
}
