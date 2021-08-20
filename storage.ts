import fs from 'fs/promises';

async function exists(filename: string) {
  try {
    await fs.access(filename);
    return true;
  } catch (_) {
    return false;
  }
}

export interface Storage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
}

export function createFileStorage(filename: string): Storage {
  return {
    get: async (key: string) => {
      let file;
      try {
        file = await fs.readFile(filename);
      } catch (_) {
        return null;
      }

      return JSON.parse(String(file))[key] ?? null;
    },
    set: async (key: string, value: any) => {
      const obj = (await exists(filename))
        ? JSON.parse(String(await fs.readFile(filename)))
        : {};

      obj[key] = value;
      await fs.writeFile(filename, JSON.stringify(obj));
    },
  };
}
