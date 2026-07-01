import { successResponse, errorResponse } from '../utils/response.util';

describe('response.util', () => {
  describe('successResponse', () => {
    it('should return a success response with data', () => {
      const result = successResponse('OK', { id: '123' });
      expect(result.success).toBe(true);
      expect(result.message).toBe('OK');
      expect(result.data).toEqual({ id: '123' });
    });

    it('should return a success response without data', () => {
      const result = successResponse('Done');
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });
  });

  describe('errorResponse', () => {
    it('should return an error response with default empty errors', () => {
      const result = errorResponse('Something went wrong');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Something went wrong');
      expect(result.errors).toEqual([]);
    });

    it('should return an error response with provided errors', () => {
      const result = errorResponse('Validation failed', ['email is invalid']);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['email is invalid']);
    });
  });
});
