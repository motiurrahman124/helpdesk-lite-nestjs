import ms from 'ms';

function durationMs(value: string, fallback: string): number {
  const parsed = ms((value || fallback) as ms.StringValue);
  if (typeof parsed !== 'number') {
    throw new Error(`Invalid duration: ${value || fallback}`);
  }
  return parsed;
}

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  app: {
    name: process.env.APP_NAME ?? 'Personal Purchase',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as
      'strict' | 'lax' | 'none',
    domain: process.env.COOKIE_DOMAIN || undefined,
    accessTokenMaxAge: durationMs(process.env.JWT_EXPIRES_IN ?? '', '15m'),
    refreshTokenMaxAge: durationMs(
      process.env.JWT_REFRESH_EXPIRES_IN ?? '',
      '7d',
    ),
  },
  otp: {
    expiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES ?? 5),
    length: Number(process.env.OTP_LENGTH ?? 6),
    exposeInResponse: process.env.OTP_EXPOSE_IN_RESPONSE === 'true',
  },
  smtp: {
    host: process.env.SMTP_HOST || undefined,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.SMTP_FROM || 'noreply@localhost',
  },
});
