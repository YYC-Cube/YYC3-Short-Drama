import { getJWTSecret, getJWTSecretCached } from '@/lib/jwt-config';

describe('JWT Config', () => {
  beforeEach(() => {
    // 真正移除该变量（注意：process.env 赋值 undefined 会被强转为字符串 "undefined"）
    delete process.env.JWT_SECRET;
    // Clear the cached secret by requiring the module again
    jest.resetModules();
  });

  describe('getJWTSecret', () => {
    it('should return the JWT secret when it is set', () => {
      const secret = 'test-secret-32-characters-long-enough';
      process.env.JWT_SECRET = secret;
      
      // Require the module again to get fresh state
      const { getJWTSecret: freshGetJWTSecret } = require('@/lib/jwt-config');
      
      expect(freshGetJWTSecret()).toBe(secret);
    });

    it('should throw an error when JWT_SECRET is not set', () => {
      // Require the module again to get fresh state
      const { getJWTSecret: freshGetJWTSecret } = require('@/lib/jwt-config');
      
      expect(() => freshGetJWTSecret()).toThrow('JWT_SECRET environment variable is not set');
    });

    it('should throw an error when JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short-secret';
      
      // Require the module again to get fresh state
      const { getJWTSecret: freshGetJWTSecret } = require('@/lib/jwt-config');
      
      expect(() => freshGetJWTSecret()).toThrow('JWT_SECRET must be at least 32 characters long');
    });
  });

  describe('getJWTSecretCached', () => {
    it('should return the cached JWT secret', () => {
      const secret = 'test-secret-32-characters-long-enough';
      process.env.JWT_SECRET = secret;
      
      // Require the module again to get fresh state
      const { getJWTSecretCached: freshGetJWTSecretCached } = require('@/lib/jwt-config');
      
      const firstCall = freshGetJWTSecretCached();
      const secondCall = freshGetJWTSecretCached();
      
      expect(firstCall).toBe(secret);
      expect(secondCall).toBe(secret);
    });

    it('should throw an error when JWT_SECRET is not set', () => {
      // Require the module again to get fresh state
      const { getJWTSecretCached: freshGetJWTSecretCached } = require('@/lib/jwt-config');
      
      expect(() => freshGetJWTSecretCached()).toThrow('JWT_SECRET environment variable is not set');
    });
  });
});
