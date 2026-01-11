/**
 * OPFS-based storage for notebook documents.
 *
 * Directory structure:
 *   /documents/
 *     {id}/
 *       document.json   - ProseMirror document JSON
 *       meta.json       - metadata (name, created, modified)
 */

export interface DocumentMeta {
  id: string;
  name: string;
  created: number;
  modified: number;
}

export interface DocumentData {
  meta: DocumentMeta;
  content: unknown; // ProseMirror JSON
}

async function getDocumentsDir(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle("documents", { create: true });
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const docsDir = await getDocumentsDir();
  const metas: DocumentMeta[] = [];

  // TypeScript types for OPFS are incomplete, cast to iterate
  const entries = docsDir as unknown as AsyncIterable<
    [string, FileSystemHandle]
  >;
  for await (const [name, handle] of entries) {
    if (handle.kind === "directory") {
      try {
        const meta = await loadMeta(name);
        if (meta) metas.push(meta);
      } catch {
        // Skip invalid directories
      }
    }
  }

  return metas.sort((a, b) => b.modified - a.modified);
}

async function loadMeta(id: string): Promise<DocumentMeta | null> {
  const docsDir = await getDocumentsDir();
  try {
    const docDir = await docsDir.getDirectoryHandle(id);
    const metaHandle = await docDir.getFileHandle("meta.json");
    const file = await metaHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as DocumentMeta;
  } catch {
    return null;
  }
}

export async function loadDocument(id: string): Promise<DocumentData | null> {
  const docsDir = await getDocumentsDir();
  try {
    const docDir = await docsDir.getDirectoryHandle(id);

    const metaHandle = await docDir.getFileHandle("meta.json");
    const metaFile = await metaHandle.getFile();
    const meta = JSON.parse(await metaFile.text()) as DocumentMeta;

    const contentHandle = await docDir.getFileHandle("document.json");
    const contentFile = await contentHandle.getFile();
    const content = JSON.parse(await contentFile.text());

    return { meta, content };
  } catch {
    return null;
  }
}

export async function saveDocument(
  id: string,
  name: string,
  content: unknown,
): Promise<DocumentMeta> {
  const docsDir = await getDocumentsDir();
  const docDir = await docsDir.getDirectoryHandle(id, { create: true });

  // Load existing meta or create new
  let meta = await loadMeta(id);
  const now = Date.now();

  if (meta) {
    meta.name = name;
    meta.modified = now;
  } else {
    meta = { id, name, created: now, modified: now };
  }

  // Write meta
  const metaHandle = await docDir.getFileHandle("meta.json", { create: true });
  const metaWritable = await metaHandle.createWritable();
  await metaWritable.write(JSON.stringify(meta, null, 2));
  await metaWritable.close();

  // Write content
  const contentHandle = await docDir.getFileHandle("document.json", {
    create: true,
  });
  const contentWritable = await contentHandle.createWritable();
  await contentWritable.write(JSON.stringify(content, null, 2));
  await contentWritable.close();

  return meta;
}

export async function deleteDocument(id: string): Promise<void> {
  const docsDir = await getDocumentsDir();
  await docsDir.removeEntry(id, { recursive: true });
}

export function generateId(): string {
  return crypto.randomUUID();
}
