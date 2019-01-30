export default function(hdWallet, offset, limit) {
  return [...Array(limit)].map((_, i) =>
    hdWallet
      .deriveChild(offset + i)
      .getWallet()
      .getChecksumAddressString(),
  );
}
