import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthService from '../auth.service';
import helpHttp from '../../helpers/helpHttp';
import cyfer from '../../helpers/cyfer';
import set from '../../helpers/set.json';

vi.mock('../../helpers/helpHttp', () => ({ default: { post: vi.fn(), get: vi.fn() } }));

// A JWT whose payload is base64url JSON (no signature check happens in the front)
const tokenFor = (payload) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.s`;

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    helpHttp.post.mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  describe('register', () => {
    it('creates the user and logs in', async () => {
      helpHttp.post
        .mockResolvedValueOnce({ message: 'User created successfully' })
        .mockResolvedValueOnce({ token: 'a.b.c', message: 'Logged in' });
      const res = await AuthService.register('sample', 'sample@example.com', 'secret', '123456');
      expect(res).toEqual({ message: 'User created successfully' });
      expect(helpHttp.post).toHaveBeenNthCalledWith(1, expect.stringMatching(/api\/users\/add$/), {
        body: { username: 'sample', email: 'sample@example.com', password: 'secret', verificationCode: '123456' },
      });
      expect(helpHttp.post).toHaveBeenNthCalledWith(2, expect.stringMatching(/api\/users\/login$/), {
        body: { username: 'sample', password: 'secret' },
      });
      expect(AuthService.getCurrentUser().token).toBe('a.b.c');
    });

    it('returns any other message without logging in (the code was sent)', async () => {
      helpHttp.post.mockResolvedValueOnce({ message: 'Verification code sent' });
      const res = await AuthService.register('sample', 'sample@example.com', 'secret');
      expect(res).toEqual({ message: 'Verification code sent' });
      expect(helpHttp.post).toHaveBeenCalledTimes(1);
    });

    it('passes a string, an array or an object message through as the error', async () => {
      helpHttp.post.mockResolvedValueOnce({ err: { message: 'Email taken' } });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: 'Email taken' } });

      helpHttp.post.mockResolvedValueOnce({ err: { message: ['Bad email', 'Short password'] } });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: ['Bad email', 'Short password'] } });

      helpHttp.post.mockResolvedValueOnce({ err: { message: { message: 'Nested' } } });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: 'Nested' } });
    });

    it('falls back to a generic error when the message is missing or unusable', async () => {
      helpHttp.post.mockResolvedValueOnce({ err: {} });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: 'Registration failed' } });

      helpHttp.post.mockResolvedValueOnce({ err: { message: { code: 1 } } });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: 'Registration failed' } });

      helpHttp.post.mockResolvedValueOnce({ err: { message: 42 } });
      expect(await AuthService.register('a', 'b', 'c', 'd')).toEqual({ err: { message: 'Registration failed' } });
    });
  });

  describe('login', () => {
    it('stores the session and returns the message', async () => {
      helpHttp.post.mockResolvedValueOnce({ token: 'a.b.c', message: 'Logged in' });
      expect(await AuthService.login('sample', 'secret')).toBe('Logged in');
      expect(localStorage.getItem('user-in')).not.toBeNull();
    });

    it('returns the API error, or a generic one, when there is no token', async () => {
      helpHttp.post.mockResolvedValueOnce({ err: { message: 'Wrong password' } });
      expect(await AuthService.login('a', 'b')).toEqual({ err: { message: 'Wrong password' } });

      helpHttp.post.mockResolvedValueOnce({});
      expect(await AuthService.login('a', 'b')).toEqual({ err: { message: 'Login failed' } });
      expect(localStorage.getItem('user-in')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('is null without a session', () => {
      expect(AuthService.getCurrentUser()).toBeNull();
    });

    it('is null, and logs, when the stored session cannot be read', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('user-in', cyfer().cy('not a session', set.salt));
      expect(AuthService.getCurrentUser()).toBeNull();
      expect(error).toHaveBeenCalled();
    });

    it('is null, quietly, for a session stored with the old cyfer: the user logs in again (change 20261120-cyfer-v2)', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('user-in', 'not a session');
      expect(AuthService.getCurrentUser()).toBeNull();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('getUserName', () => {
    it('reads the role and username from the token', () => {
      expect(AuthService.getUserName(tokenFor({ role: 'admin', username: 'sample', id: 1 }))).toEqual({
        role: 'admin',
        username: 'sample',
      });
    });

    it('is null without a token', () => {
      expect(AuthService.getUserName('')).toBeNull();
      expect(AuthService.getUserName(undefined)).toBeNull();
    });

    it('is null, and logs, for a token it cannot decode', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(AuthService.getUserName('no-dots')).toBeNull();
      expect(error).toHaveBeenCalled();
    });
  });

  describe('password reset (Auth SPEC v0.5, C4 and C5)', () => {
    it('asks for a code with the email and returns the message', async () => {
      helpHttp.post.mockResolvedValueOnce({ error: false, message: 'If an account uses this email, a code was sent' });
      expect(await AuthService.requestPasswordReset('sample@example.com')).toEqual({
        message: 'If an account uses this email, a code was sent',
      });
      expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/api\/users\/password-reset\/request$/), {
        body: { email: 'sample@example.com' },
      });
    });

    it('confirms with email, code and new password', async () => {
      helpHttp.post.mockResolvedValueOnce({ error: false, message: 'Password changed' });
      expect(await AuthService.confirmPasswordReset('sample@example.com', '123456', 'newSecret')).toEqual({
        message: 'Password changed',
      });
      expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/api\/users\/password-reset\/confirm$/), {
        body: { email: 'sample@example.com', code: '123456', newPassword: 'newSecret' },
      });
    });

    it('returns the API error, or a fallback for each step', async () => {
      helpHttp.post.mockResolvedValueOnce({ err: { message: 'Invalid email format' } });
      expect(await AuthService.requestPasswordReset('x')).toEqual({ err: { message: 'Invalid email format' } });

      helpHttp.post.mockResolvedValueOnce({ err: {} });
      expect(await AuthService.requestPasswordReset('x')).toEqual({ err: { message: 'Unknown error' } });

      helpHttp.post.mockResolvedValueOnce({ err: {} });
      expect(await AuthService.confirmPasswordReset('x', '1', 'y')).toEqual({ err: { message: 'Invalid or expired code' } });
    });
  });
});
