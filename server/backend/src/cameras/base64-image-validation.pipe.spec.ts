import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Base64ImageValidationPipe } from './base64-image-validation.pipe';
import { ImageBuffer } from './image-buffer';

const TEST_IMAGE_BASE64 =
  '/9j/4AAQSkZJRgABAQEADwAPAAD/2wBDAEMuMjoyKkM6NjpLR0NPZKZsZFxcZMySmnmm8dT++u3U' +
  '6eX//////////+Xp////////////////////////////2wBDAUdLS2RXZMRsbMT//+n/////////' +
  '////////////////////////////////////////////////////////////wgARCAALAAsDASIA' +
  'AhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAECA//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAM' +
  'AwEAAhADEAAAAa0Gf//EABYQAAMAAAAAAAAAAAAAAAAAAAEQMf/aAAgBAQABBQI1/wD/xAAUEQEA' +
  'AAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/' +
  'AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAY/Ah//xAAZEAEAAgMAAAAAAAAAAAAAAAAB' +
  'ADEQEUH/2gAIAQEAAT8hT1ohUQWsf//aAAwDAQACAAMAAAAQ8//EABQRAQAAAAAAAAAAAAAAAAAA' +
  'AAD/2gAIAQMBAT8Qf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Qf//EABkQAQACAwAA' +
  'AAAAAAAAAAAAAAEAERAxof/aAAgBAQABPxCx7IUI7qCFCmP/2Q==';

describe(Base64ImageValidationPipe, () => {
  it('should throw an error if the data is not a base64 encoded image', () => {
    const pipe = new Base64ImageValidationPipe();
    expect(() => {
      pipe.transform('wawa', { type: 'body', metatype: String, data: 'test' });
    }).toThrow(BadRequestException);
  });

  it('should transform base64-encoded images', () => {
    const pipe = new Base64ImageValidationPipe();
    expect(
      pipe.transform(TEST_IMAGE_BASE64, {
        type: 'body',
        metatype: String,
        data: 'test',
      }),
    ).toEqual(Buffer.from(TEST_IMAGE_BASE64, 'base64') as ImageBuffer);
  });
});
