import jwt from 'jsonwebtoken';

export class JwtHelper {
  static sign(payload: object, secret: string, expiresIn: string | number) {
    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
  }

  static verify<T>(token: string, secret: string): T {
    return jwt.verify(token, secret) as T;
  }
}
