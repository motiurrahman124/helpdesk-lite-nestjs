import { UserStatus } from '../../generated/prisma/client.js';

export function inactiveStatusMessage(status: UserStatus): string {
  switch (status) {
    case UserStatus.PENDING:
      return 'Your account is pending approval. Please complete verification or wait for admin approval.';
    case UserStatus.INACTIVE:
      return 'Your account is inactive. Please contact support.';
    case UserStatus.SUSPENDED:
      return 'Your account has been suspended. Please contact support.';
    case UserStatus.BLOCKED:
      return 'Your account has been blocked. Please contact support.';
    default:
      return 'Your account is not active.';
  }
}
