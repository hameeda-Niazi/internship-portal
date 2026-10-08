import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

export function loadEnvironment() {
  const envPath = fileURLToPath(new URL('../.env', import.meta.url));
  const result = dotenv.config({ path: envPath });
  if (result.error && result.error.code !== 'ENOENT') throw result.error;
}
