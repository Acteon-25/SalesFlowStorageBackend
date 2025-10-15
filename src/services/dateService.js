import { TZDate } from "@date-fns/tz";

export const convertirFecha = (fechaUTC, zonaHoraria = "America/Lima") => {
  const fechaLocal = new TZDate(fechaUTC, zonaHoraria);

  return fechaLocal
};
