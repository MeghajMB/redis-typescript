import type net from "net";
import type { Lists } from "./list";
export const DATA: Map<string, { value: string; expiresAt: null | number }> =
  new Map();

export const INFO: Map<string, string> = new Map();
INFO.set("master_replid", "c96e175ea9dbdda5b38cbfe0b620134f388b7386");
INFO.set("master_repl_offset", "0");

export const REPLICA_CONNECTIONS: Map<
  string,
  { connection: net.Socket; offset: number; connectionTimeOffset: number }
> = new Map();

export class ReplicaOffset {
  private static _replica_offset = 0;

  static get() {
    return this._replica_offset;
  }
  static set(val: number) {
    this._replica_offset = val;
  }
}

export class RelativeMasterOffset {
  private static _relative_master_offset = 0;

  static get() {
    return this._relative_master_offset;
  }
  static set(val: number) {
    this._relative_master_offset = val;
  }
}

export const CONFIG = {
  dir: "",
  dbfilename: "",
};

export const LISTS: Map<string, Lists> = new Map();

export const STREAM: Map<string, Record<string, string>[]> = new Map();
