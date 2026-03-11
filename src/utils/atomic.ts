import { rename, symlink, unlink } from 'node:fs/promises';

export async function atomicWrite(filePath: string, data: unknown): Promise<void> {
  const tempPath = `${filePath}.tmp.${process.pid}`;
  try {
    await Bun.write(tempPath, JSON.stringify(data, null, 2), { mode: 0o600 });
    await rename(tempPath, filePath);
  } catch (error) {
    try {
      await unlink(tempPath);
    } catch {}
    throw error;
  }
}

export async function atomicCopy(sourcePath: string, targetPath: string): Promise<void> {
  const tempPath = `${targetPath}.tmp.${process.pid}`;
  try {
    const sourceBytes = await Bun.file(sourcePath).arrayBuffer();
    await Bun.write(tempPath, sourceBytes, { mode: 0o600 });
    await rename(tempPath, targetPath);
  } catch (error) {
    try {
      await unlink(tempPath);
    } catch {}
    throw error;
  }
}

export async function atomicSymlink(target: string, linkPath: string): Promise<void> {
  const tempLink = `${linkPath}.tmp.${process.pid}`;
  try {
    await symlink(target, tempLink);
    await rename(tempLink, linkPath);
  } catch (error) {
    try {
      await unlink(tempLink);
    } catch {}
    throw error;
  }
}
