export type IconSource = {
  size: number;
  blob: Blob;
};

export async function encodeICO(sources: IconSource[]): Promise<Blob> {
  if (sources.length === 0) {
    throw new Error("No icon sources provided");
  }

  const ordered = [...sources].sort((a, b) => a.size - b.size);
  const buffers = await Promise.all(
    ordered.map(async (entry) => ({
      size: entry.size,
      data: new Uint8Array(await entry.blob.arrayBuffer()),
    })),
  );

  const count = buffers.length;
  const headerSize = 6 + count * 16;
  const totalSize = headerSize + buffers.reduce((sum, item) => sum + item.data.length, 0);
  const outputBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(outputBuffer);
  const bytes = new Uint8Array(outputBuffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type 1 = icon
  view.setUint16(4, count, true); // image count

  let offset = headerSize;

  buffers.forEach((entry, index) => {
    const { size, data } = entry;
    const headerOffset = 6 + index * 16;
    const iconDim = size >= 256 ? 0 : size;

    view.setUint8(headerOffset + 0, iconDim); // width
    view.setUint8(headerOffset + 1, iconDim); // height
    view.setUint8(headerOffset + 2, 0); // color count (0 = unspecified)
    view.setUint8(headerOffset + 3, 0); // reserved
    view.setUint16(headerOffset + 4, 1, true); // planes
    view.setUint16(headerOffset + 6, 32, true); // bitcount
    view.setUint32(headerOffset + 8, data.length, true); // bytes in resource
    view.setUint32(headerOffset + 12, offset, true); // image offset

    bytes.set(data, offset);
    offset += data.length;
  });

  return new Blob([outputBuffer], { type: "image/x-icon" });
}

