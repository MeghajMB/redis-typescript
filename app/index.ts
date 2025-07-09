import * as net from "net";
import respEncoder from "./util/resp-encoder";
import { RESPSTATE } from "./enum/resp-state.enum";

const DATA: Map<any, { value: string; expiresAt: null | number }> = new Map();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const input = data.toString().trim();

    const lines = input.split("\r\n");
    const command = lines[2]?.toUpperCase();

    if (command == "PING") {
      const result = respEncoder(RESPSTATE.STRING, "PONG");
      connection.write(result);
    } else if (command == "ECHO") {
      const message = lines[4];
      const result = respEncoder(RESPSTATE.BULK_STRING, message);
      connection.write(result);
    } else if (command == "SET") {
      const key = lines[4];
      const value = lines[6];
      const option = lines[8]?.toUpperCase();
      const ttl = Number(lines[10]);
      if (!value) return;
      if (option == "PX" && !isNaN(ttl)) {
        DATA.set(key, { value, expiresAt: Date.now() + ttl });
      } else {
        DATA.set(key, { value, expiresAt: null });
      }

      const result = respEncoder(RESPSTATE.SUCCESS);
      connection.write(result);
    } else if (command == "GET") {
      const key = lines[4];
      const record = DATA.get(key);
      if (!record) throw new Error("No key set");
      let result;
      if (record.expiresAt !== null && Date.now() > record.expiresAt) {
        DATA.delete(key);
        result = respEncoder(RESPSTATE.NULL_BULK_STRING);
      } else {
        result = respEncoder(RESPSTATE.BULK_STRING, record.value);
      }

      connection.write(result);
    }
  });
});
//
server.listen(6379, "127.0.0.1");
