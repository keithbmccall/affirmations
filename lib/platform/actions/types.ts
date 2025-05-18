export type ActionType<Name extends string, Payload = unknown> = {
  type: Name;
  payload: Payload;
};
