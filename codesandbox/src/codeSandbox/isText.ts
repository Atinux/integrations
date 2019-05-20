/**
 * Brought here from https://github.com/codesandbox/codesandbox-importers/blob/master/packages/import-utils/src/is-text.ts
 * Modified to avoid importing `istextorbinary` directly, because it's using the `entities` which breaks ncc
 *
 * Copyright (c) Ives van Hoorne
 */
const _isText = require('istextorbinary/source/index').isText;

const jsRegex = /(t|j)sx?$/i;

const FILE_LOADER_REGEX = /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm)(\?.*)?$/i;
export const MAX_FILE_SIZE = 512 * 1024;

export const isText = (filename: string, buffer: Buffer) => {
  if (jsRegex.test(filename)) {
    return true;
  }

  return new Promise((resolve, reject) => {
    _isText(filename, buffer, (err: Error, result: boolean) => {
      if (err) {
        return reject(err);
      }

      // We don't support null bytes in the database with postgres,
      // so we need to mark it as binary if there are null bytes
      const hasNullByte = buffer.toString().includes('\0');

      resolve(result && !FILE_LOADER_REGEX.test(filename) && !isTooBig(buffer) && !hasNullByte);
    });
  });
};

export const isTooBig = (buffer: Buffer) => {
  return buffer.length > MAX_FILE_SIZE;
};
