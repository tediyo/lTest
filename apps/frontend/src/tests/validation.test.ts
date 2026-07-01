import { loginSchema, registerSchema } from '../utils/validation';

describe('loginSchema', () => {
  it('should pass validation with valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should fail when email is missing', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
    }
  });

  it('should fail when email format is invalid', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes('email'));
      expect(emailError?.message).toContain('valid email');
    }
  });

  it('should fail when password is missing', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('password'))).toBe(true);
    }
  });

  it('should fail when password is shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find((i) => i.path.includes('password'));
      expect(passwordError?.message).toContain('6 characters');
    }
  });

  it('should fail when email is an empty string', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should fail when password is an empty string', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('should pass with exactly 6 character password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' });
    expect(result.success).toBe(true);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('should pass with valid data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('should fail when email is missing', () => {
    const result = registerSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid email format', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should fail when password is too short', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'abc', confirmPassword: 'abc' });
    expect(result.success).toBe(false);
  });

  it('should fail when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('should fail when confirmPassword is empty', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: '' });
    expect(result.success).toBe(false);
  });
});
