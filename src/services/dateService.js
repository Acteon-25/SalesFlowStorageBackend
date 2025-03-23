import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const convertirFecha = (fechaUTC, zonaHoraria = "America/Lima") => {
  const fechaLocal = new TZDate(fechaUTC, zonaHoraria);

  return format(fechaLocal, "yyyy-MM-dd HH:mm:ss");
};
