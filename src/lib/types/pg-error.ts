// TODO: Описание. Что означает code, зачем нужен, какие значения может содержать

export interface PostgresError extends Error {
  code: string;
}
