# 🧠 Custom Redis Implementation in TypeScript

This project is a custom implementation of Redis built in **TypeScript**, using **Bun** and **netcat** for server and client communication.

## ⚙️ Requirements

* [Bun](https://bun.sh/docs/installation)
* netcat (e.g., `ncat` on Linux)

## 🚀 Getting Started

Start the main Redis server:

```bash
bun run app/index.ts
```

Start a replica Redis server:

```bash
bun run app/index.ts --port 6380 --replicaof "localhost 6379"
```

Send commands using `netcat`:

```bash
printf '*1\r\n$4\r\nPING\r\n' | ncat 127.0.0.1 6379
```

## 🧪 Features

* RESP (REdis Serialization Protocol) compliant parser and encoder
* In-memory key-value storage
* Supports replication with `REPLCONF`, `PSYNC`, and `WAIT`
* Expiry key deletion handled in a separate thread
* Blocking list operations like `BLPOP`
* Stream data structure support (`XADD`, `XREAD`, `XRANGE`)
* Transaction support using `MULTI`, `EXEC`, and `DISCARD`
* Built using **Registry Pattern** for command handling with dependency injection

## 📦 Supported Commands

### 🔧 Core * `PING`,`ECHO`,`SET`,`GET`,`INFO`,`CONFIG`,`KEYS`,`TYPE`,`INCR`

### 🧬 Replication

* `REPLCONF`
* `PSYNC`
* `WAIT`

### 📋 Lists

* `RPUSH`
* `LPUSH`
* `LRANGE`
* `LLEN`
* `LPOP`
* `BLPOP`

### 🔁 Streams

* `XADD`
* `XRANGE`
* `XREAD`

### 💼 Transactions

* `MULTI`
* `EXEC`
* `DISCARD`

## 🧱 Architecture

Commands are handled using a **Registry Pattern**, where each command is registered using a `register()` function. This enables clean separation of logic and dependency injection for shared components like the in-memory store and replication sockets.

```ts
this.register("SET", new SetCommand(REPLICA_CONNECTIONS, DATA));
```

## 📌 TODO

* [ ] Delete expired keys using a background thread
* [ ] Add more stream commands like `XDEL`, `XTRIM`
* [ ] Support pub/sub