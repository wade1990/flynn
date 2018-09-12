#!/bin/bash

set -eo pipefail

apt-get update
apt-get install --yes unzip
apt-get clean

# install protobuf compiler
pbversion="3.6.1"
tmpdir=$(mktemp --directory)
trap "rm -rf ${tmpdir}" EXIT
curl -sL https://github.com/google/protobuf/releases/download/v${pbversion}/protoc-${pbversion}-linux-x86_64.zip > "${tmpdir}/protoc.zip"
unzip -d "${tmpdir}/protoc" "${tmpdir}/protoc.zip"
mv "${tmpdir}/protoc" /opt
ln -s /opt/protoc/bin/protoc /usr/local/bin/protoc

# install googleapis common protos
curl -fSLo /tmp/common-protos.tar.gz "https://github.com/googleapis/googleapis/archive/common-protos-1_3_1.tar.gz"
tar xzf /tmp/common-protos.tar.gz -C "/opt/protoc/include" --strip-components=1
rm /tmp/common-protos.tar.gz
