import { ConfigService } from '@nestjs/config';

/**
 * Gets a Base64 encoded string from config, throws error if missing,
 * and returns the decoded Buffer.
 */
export function getRequiredBase64Config(
  configService: ConfigService,
  key: string,
): Buffer {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(
      `Configuration Error: ${key} is not defined in environment variables`,
    );
  }

  try {
    return Buffer.from(value, 'base64');
  } catch {
    throw new Error(`Configuration Error: Failed to decode Base64 for ${key}`);
  }
}
