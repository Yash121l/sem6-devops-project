import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@common/enums';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
    action: AuditAction;
    entityType: string;
}

export const Auditable = (action: AuditAction, entityType: string) =>
    SetMetadata(AUDIT_KEY, { action, entityType } as AuditMetadata);
