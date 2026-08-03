import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export function encryptCredential(value: string, keyValue = process.env.CREDENTIAL_ENCRYPTION_KEY): string {
  if (!value) throw new Error("credential_required");
  const key = parseKey(keyValue);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptCredential(value: string, keyValue = process.env.CREDENTIAL_ENCRYPTION_KEY): string {
  const [ivValue, tagValue, ciphertextValue] = value.split(".");
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error("credential_ciphertext_invalid");
  const decipher = createDecipheriv("aes-256-gcm", parseKey(keyValue), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function parseKey(value: string | undefined): Buffer {
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new Error("CREDENTIAL_ENCRYPTION_KEY_must_be_32_byte_hex");
  return Buffer.from(value, "hex");
}
