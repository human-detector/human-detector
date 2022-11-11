import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Paramtype,
  PipeTransform,
} from '@nestjs/common';
import {
  DEFAULT_ACCEPTED_IMAGE_MIME_TYPES,
  ImageBuffer,
  imageBufferFromBuffer,
} from './image-buffer';

type Field = { type: Paramtype; name: string };

/**
 * Verifies that the given set of fields contain a base64-encoded image and transforms them
 * into Buffer objects.
 */
@Injectable()
export class Base64ImageValidationPipe
  implements PipeTransform<string, ImageBuffer | string>
{
  constructor(
    private fields: Field[],
    private acceptedMimeTypes = DEFAULT_ACCEPTED_IMAGE_MIME_TYPES,
  ) {}

  transform(value: string, metadata: ArgumentMetadata) {
    if (
      metadata.data === undefined ||
      this.fields.find(
        (field) => field.type === metadata.type && field.name === metadata.data,
      ) === undefined
    ) {
      return value;
    }

    if (metadata.metatype != String || typeof value !== 'string') {
      throw new BadRequestException(
        `Param "${metadata.data}" is not a string.`,
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
