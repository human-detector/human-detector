import { Client } from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { PostAuthenticationTriggerEvent } from "aws-lambda";

const DB_NAME = process.env["DB_NAME"]!;
const DB_USER = process.env["DB_USER"]!;
const DB_HOST = process.env["DB_HOST"]!;

const signer = new Signer({
  hostname: DB_HOST,
  username: DB_USER,
  port: 5432,
});

export async function handler(event: PostAuthenticationTriggerEvent) {
  const userId = event.request.userAttributes["sub"];
  console.log(`Syncing user "${userId}"`);
  const dbToken = await signer.getAuthToken();
  const dbClient = new Client({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    port: 5432,
    password: dbToken,
    // RDS requires SSL for IAM auth connections
    ssl: {
      rejectUnauthorized: false,
      requestCert: true,
    },
  });
  await dbClient.connect();
  await dbClient.query(
    // Ensure that user ID makes it in, ignoring it if it's already present
    'INSERT INTO "user"(id) VALUES ($1) ON CONFLICT DO NOTHING;',
    [userId]
  );
  await dbClient.end();
  return event;
}
