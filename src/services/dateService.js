import { TZDate } from "@date-fns/tz";

// Convierte una fecha UTC de la BD a la zona horaria del usuario
export const convertirFechaAZonaHoraria = (fechaUTC, zonaHoraria = "America/Lima") => {
  const fecha = new TZDate(fechaUTC, zonaHoraria);
  return fecha.toISOString(); // Retorna en formato ISO para JSON
};

// Convierte una fecha local (sin hora) a UTC para consultar la BD
export const convertirFechaLocalAUTC = (fechaLocal, zonaHoraria = "America/Lima") => {
  // fechaLocal viene como "2025-10-14"
  const fecha = new TZDate(fechaLocal, zonaHoraria);
  return fecha.toISOString();
};

// Obtiene el inicio del día en la zona horaria del usuario (00:00:00)
export const obtenerInicioDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  const fecha = new TZDate(`${fechaLocal}T00:00:00`, zonaHoraria);
  return fecha.toISOString();
};

// Obtiene el fin del día en la zona horaria del usuario (23:59:59.999)
export const obtenerFinDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  const fecha = new TZDate(`${fechaLocal}T23:59:59.999`, zonaHoraria);
  return fecha.toISOString();
};