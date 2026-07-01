import { validate } from 'class-validator';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterDto', () => {
  const createDto = (overrides: Partial<RegisterDto> = {}): RegisterDto => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    Object.assign(dto, overrides);
    return dto;
  };

  it('should pass with valid email and password', async () => {
    const errors = await validate(createDto());
    expect(errors).toHaveLength(0);
  });

  it('should fail with missing email', async () => {
    const dto = createDto({ email: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail with invalid email format', async () => {
    const dto = createDto({ email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail with password shorter than 6 characters', async () => {
    const dto = createDto({ password: 'abc' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail with password longer than 72 characters', async () => {
    const dto = createDto({ password: 'a'.repeat(73) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should pass with password exactly 6 characters', async () => {
    const dto = createDto({ password: 'abcdef' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
