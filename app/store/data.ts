import type net from "net";
export const DATA: Map<string, { value: string; expiresAt: null | number }> =
  new Map();

export const INFO: Map<string, string> = new Map();
INFO.set("master_replid", "c96e175ea9dbdda5b38cbfe0b620134f388b7386");
INFO.set("master_repl_offset", "0");

export const REPLICA_CONNECTIONS: Map<string, net.Socket> = new Map();
