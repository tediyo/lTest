import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dto/login.dto';

async function validateDto(data: object): Promise<string[]> {
  const dto = plainToInstance(LoginDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints || {}));
}

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const errors = await validateDto({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(errors).toHaveLength(0);
  });

  it('should fail when email is missing', async () => {
    const errors = await validateDto({ password: 'password123' });
    expect(errors.some((e) => e.includes('email'))).toBe(true);
  });

  it('should fail when email is invalid format', async () => {
    const errors = await validateDto({ email: 'not-an-email', password: 'password123' });
    expect(errors.some((e) => e.includes('valid email'))).toBe(true);
  });

  it('should fail when password is missing', async () => {
    const errors = await validateDto({ email: 'test@example.com' });
    expect(errors.some((e) => e.includes('Password') || e.includes('password'))).toBe(true);
  });

  it('should fail when password is too short (less than 6 chars)', async () => {
    const errors = await validateDto({ email: 'test@example.com', password: '123' });
    expect(errors.some((e) => e.includes('6 characters'))).toBe(true);
  });

  it('should fail when both email and password are missing', async () => {
    const errors = await validateDto({});
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when email is an empty string', async () => {
    const errors = await validateDto({ email: '', password: 'password123' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when password is an empty string', async () => {
    const errors = await validateDto({ email: 'test@example.com', password: '' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
