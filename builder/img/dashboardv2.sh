#!/bin/bash

set -eo pipefail

version="8.11.4"
shasum="c69abe770f002a7415bd00f7ea13b086650c1dd925ef0c3bf8de90eabecc8790"
dir="/usr/local"

apt-get update
apt-get install --yes unzip python
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

# install nodejs
curl -fSLo /tmp/node.tar.gz "https://nodejs.org/dist/v${version}/node-v${version}-linux-x64.tar.gz"
echo "${shasum}  /tmp/node.tar.gz" | shasum -c -
tar xzf /tmp/node.tar.gz -C "${dir}"
rm /tmp/node.tar.gz

# link nodejs binary
nodebin="${dir}/node-v${version}-linux-x64/bin"
ln -nfs ${nodebin}/node ${dir}/bin/node
ln -nfs ${nodebin}/npm ${dir}/bin/npm

# install typescript protoc (https://github.com/improbable-eng/ts-protoc-gen)
npm install -g ts-protoc-gen
