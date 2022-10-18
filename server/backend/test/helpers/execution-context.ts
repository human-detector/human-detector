import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getMockReq } from '@jest-mock/express';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Create a mock HTTP execution context that will return a request with the given parameters.
 */
export function createMockHttpExecutionContext(
  requestOptions?: Parameters<typeof getMockReq>[0],
): DeepMocked<ExecutionContext> {
  // '@jest-mock/express' doesn't provide a default header() implementation,
  // so we need to do that ourselves if we want to pass headers as a dict
  if (requestOptions && requestOptions.headers && !requestOptions.header) {
    const mockHeader = jest.fn() as jest.MockedFunction<Request['header']>;
    mockHeader.mockImplementation((name) => {
      const header: string | string[] | undefined =
        requestOptions.headers[name.toLowerCase()];
      if (header === undefined) {
        return undefined;
      } else if (typeof header === 'string') {
        return header;
      } else {
        return header[0];
      }
    });
    requestOptions.header = mockHeader as jest.Mock;
  }
  const mockReq = getMockReq(requestOptions);
  const mockExecutionContext = createMock<ExecutionContext>();
  mockExecutionContext.switchToHttp.mockReturnValueOnce({
    getRequest: <T = any>() => mockReq as unknown as T,
    getNext: () => undefined,
    getResponse: () => undefined,
  });
  return mockExecutionContext;
}
