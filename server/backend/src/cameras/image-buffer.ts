import filetype from 'magic-bytes.js';

export type ImageBuffer = Buffer & { __tag: 'ImageBuffer' };

export class InvalidMimeTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidMimeTypeError';
  }
}

export const DEFAULT_ACCEPTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
]);

/**
 * Validates that the given buffer contains an image and converts it to a checked type.
 * @param buffer image bytes
 * @param acceptedMimeTypes accepted mime types (e.g. `image/jpeg`)
 * @returns checked image buffer
 * @throws `InvalidMimeTypeError` if the detected file type isn't in the list of accepted types
 */
export function imageBufferFromBuffer(
  buffer: Buffer,
  acceptedMimeTypes = DEFAULT_ACCEPTED_IMAGE_MIME_TYPES,
): ImageBuffer {
  const guessedTypes = filetype(buffer);
  const isImage =
    guessedTypes.find(
      (guess) => guess.mime && acceptedMimeTypes.has(guess.mime),
    ) !== undefined;
  if (!isImage) {
    const acceptableTypesString = Array.from(acceptedMimeTypes).join(', ');
    const guessedTypesString = guessedTypes.join(', ');
    throw new InvalidMimeTypeError(
      `Expected one of [${acceptableTypesString}], got [${guessedTypesString}]`,
    );
  }
  return buffer as ImageBuffer;
}
