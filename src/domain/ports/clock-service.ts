/** Puerto para obtener la hora actual, para que los casos de uso sean testeables sin Date real. */
export interface ClockService {
  now(): Date;
}
