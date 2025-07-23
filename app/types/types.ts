import type { RESPSTATE } from "../enum/resp-state.enum";

export type RESPStateType = '' | `${RESPSTATE}`;
export type RESPData = string | string[] | RESPData[];