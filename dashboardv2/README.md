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

