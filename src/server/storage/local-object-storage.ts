import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectStorageAdapter, PutObjectInput, StoredObject } from "@/server/storage/object-storage";

export class LocalObjectStorageAdapter implements ObjectStorageAdapter {
  constructor(private readonly rootDirectory: string) {}

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const objectPath = this.objectPath(input.bucket, input.key);
    await mkdir(path.dirname(objectPath), { recursive: true });
    await writeFile(objectPath, input.body);

    const stats = await stat(objectPath);
    return {
      bucket: input.bucket,
      key: input.key,
      contentType: input.contentType,
      size: stats.size,
      updatedAt: stats.mtime.toISOString()
    };
  }

  async getObject(bucket: string, key: string): Promise<Buffer> {
    return readFile(this.objectPath(bucket, key));
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await rm(this.objectPath(bucket, key), { force: true });
  }

  private objectPath(bucket: string, key: string): string {
    const safeBucket = sanitizePathSegment(bucket);
    const safeKey = key.split("/").map(sanitizePathSegment).join(path.sep);
    return path.join(this.rootDirectory, safeBucket, safeKey);
  }
}

function sanitizePathSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9._-]/g, "_");
}
