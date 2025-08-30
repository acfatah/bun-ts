import Bun from 'bun'

/**
 * @see https://bun.sh/docs/api/file-io#writing-files-bun-write
 */
export async function writeFile(
  destination: string,
  data: string | Blob | BlobPart[] | ArrayBufferLike | NodeJS.TypedArray | ArrayBufferLike,
) {
  // @ts-expect-error Bunfile type mismatch
  Bun.write(destination, data)
}
