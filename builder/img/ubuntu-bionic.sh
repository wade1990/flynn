#!/bin/bash

TMP="$(mktemp --directory)"

URL="https://partner-images.canonical.com/core/bionic/20190507/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz"
SHA="829f86af060ffb344a1e0aa4e43ae896ecc3eb1ef16f132c6e739f567fdc52d6"
curl -fSLo "${TMP}/ubuntu.tar.gz" "${URL}"
echo "${SHA}  ${TMP}/ubuntu.tar.gz" | sha256sum -c -

mkdir -p "${TMP}/root"
tar xf "${TMP}/ubuntu.tar.gz" -C "${TMP}/root"

cp "/etc/resolv.conf" "${TMP}/root/etc/resolv.conf"
mount --bind "/dev/pts" "${TMP}/root/dev/pts"
cleanup() {
  umount "${TMP}/root/dev/pts"
  >"${TMP}/root/etc/resolv.conf"
}
trap cleanup EXIT

chroot "${TMP}/root" bash -e < "builder/ubuntu-setup.sh"

mksquashfs "${TMP}/root" "/mnt/out/layer.squashfs" -noappend
