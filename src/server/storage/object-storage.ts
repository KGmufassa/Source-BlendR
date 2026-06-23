export type StoredObject = {
  bucket: string;
  key: string;
  contentType: string;
  size: number;
  updatedAt: string;
};

export type PutObjectInput = {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
};

export interface ObjectStorageAdapter {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  getObject(bucket: string, key: string): Promise<Buffer>;
  deleteObject(bucket: string, key: string): Promise<void>;
}
