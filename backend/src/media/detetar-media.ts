import { createHash } from "node:crypto";

export function calcularSha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function detetarMime(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  )
    return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (bytes.length >= 3 && String.fromCharCode(...bytes.slice(0, 3)) === "ID3")
    return "audio/mpeg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(4, 8)) === "ftyp"
  )
    return "video/mp4";
  return null;
}

export function dimensoesDaImagem(
  bytes: Uint8Array,
  mime: string,
): Readonly<{ altura: number; largura: number }> | null {
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (mime === "image/png" && bytes.length >= 24) {
    const largura = vista.getUint32(16);
    const altura = vista.getUint32(20);
    return largura > 0 && altura > 0 ? { altura, largura } : null;
  }
  if (mime === "image/jpeg") {
    let posicao = 2;
    while (posicao + 8 < bytes.length) {
      if (bytes[posicao] !== 0xff) return null;
      const marcador = bytes[posicao + 1] ?? 0;
      const tamanho = vista.getUint16(posicao + 2);
      if (tamanho < 2 || posicao + tamanho + 2 > bytes.length) return null;
      if (marcador >= 0xc0 && marcador <= 0xc3) {
        const altura = vista.getUint16(posicao + 5);
        const largura = vista.getUint16(posicao + 7);
        return largura > 0 && altura > 0 ? { altura, largura } : null;
      }
      posicao += tamanho + 2;
    }
  }
  return null;
}
