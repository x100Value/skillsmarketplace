import type { PoolClient } from "pg";

type AuditInput = {
  actorType: "user" | "system" | "admin";
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(
  client: PoolClient,
  input: AuditInput
): Promise<void> {
  await client.query(
    `INSERT INTO audit_logs
      (actor_type, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      input.actorType,
      input.actorId,
      input.action,
      input.entityType,
      input.entityId,
      JSON.stringify(input.metadata ?? {})
    ]
  );
}
