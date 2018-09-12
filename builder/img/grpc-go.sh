#!/bin/bash

set -eo pipefail

# install go pkgs
echo "GOPATH: $GOPATH"
go get -u github.com/golang/protobuf/proto
go get -u github.com/golang/protobuf/protoc-gen-go
go get -u google.golang.org/grpc

cp /go/bin/protoc-gen-go /bin

git clone https://github.com/grpc-ecosystem/grpc-gateway /go/src/github.com/grpc-ecosystem/grpc-gateway
