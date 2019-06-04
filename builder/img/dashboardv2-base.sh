#!/bin/bash

set -eo pipefail

apt-get update
apt-get install --yes unzip python make
apt-get clean

# install protobuf compiler
pbversion="3.7.1"
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
nodeversion="8.11.4"
nodeshasum="c69abe770f002a7415bd00f7ea13b086650c1dd925ef0c3bf8de90eabecc8790"
nodedir="/usr/local"
curl -fSLo /tmp/node.tar.gz "https://nodejs.org/dist/v${nodeversion}/node-v${nodeversion}-linux-x64.tar.gz"
echo "${nodeshasum}  /tmp/node.tar.gz" | shasum -c -
tar xzf /tmp/node.tar.gz -C "${nodedir}"
rm /tmp/node.tar.gz

# link nodejs binary
nodebin="${nodedir}/node-v${nodeversion}-linux-x64/bin"
ln -nfs ${nodebin}/node ${nodedir}/bin/node
ln -nfs ${nodebin}/npm ${nodedir}/bin/npm

# install typescript protoc (https://github.com/improbable-eng/ts-protoc-gen)
npm install -g google-protobuf ts-protoc-gen

# install yarn
curl -o- -L https://yarnpkg.com/install.sh | bash # TODO(jvatic): perform checksum
ln -s /.yarn/bin/yarn /usr/local/bin/yarn
