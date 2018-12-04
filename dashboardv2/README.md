dashboardv2
===========

## Development

### Generate protobuf files

```
(github.com/flynn/flynn) $ vagrant up && vagrant ssh
$ make
$ ./script/dashboardv2-dev generate
```

### Run dev server

```
(github.com/flynn/flynn) $ vagrant up && vagrant ssh
$ make
$ ./script/bootstrap-flynn
$ ./script/dashboardv2-dev start
```

### Run dev controller-grpc server

```
(github.com/flynn/flynn) $ cd controller-grpc
$ PORT=3000 CONTROLLER_DOMAIN=http://controller.1.localflynn.com CONTROLLER_AUTH_KEY=<PASTE FROM bootstrap-flynn cmd above> go run controller.go controller.pb.go
```

[http://dashboard.1.localflynn.com:4458/](http://dashboard.1.localflynn.com:4458/)
