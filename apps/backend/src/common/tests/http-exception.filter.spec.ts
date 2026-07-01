import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

function createMockArgumentsHost(method = 'GET', url = '/test'): ArgumentsHost {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = {
    method,
    url,
  };

  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should handle HttpException and return proper error response', () => {
    const host = createMockArgumentsHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
      }),
    );
  });

  it('should handle validation errors with array of messages', () => {
    const host = createMockArgumentsHost();
    const exception = new HttpException(
      { message: ['email must be valid', 'password is required'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: ['email must be valid', 'password is required'],
      }),
    );
  });

  it('should handle generic Error as 500 Internal Server Error', () => {
    const host = createMockArgumentsHost();
    const exception = new Error('Database connection failed');

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
