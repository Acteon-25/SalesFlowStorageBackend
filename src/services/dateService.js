import { TZDate } from "@date-fns/tz";

// Convierte "2025-10-14" a "2025-10-14 00:00:00" en la zona horaria del usuario
// y luego a formato PostgreSQL timestamp
export const obtenerInicioDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    // Crear fecha en la zona horaria específica
    const fechaStr = `${fechaLocal}T00:00:00`;
    const tzDate = new TZDate(fechaStr, zonaHoraria);
    
    // Convertir a UTC para PostgreSQL
    return tzDate.toISOString().replace('T', ' ').substring(0, 19);
  } catch (error) {
    console.error('Error en obtenerInicioDia:', error, { fechaLocal, zonaHoraria });
    // Fallback: formato simple
    return `${fechaLocal} 00:00:00`;
  }
};

export const obtenerFinDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    const fechaStr = `${fechaLocal}T23:59:59`;
    const tzDate = new TZDate(fechaStr, zonaHoraria);
    
    return tzDate.toISOString().replace('T', ' ').substring(0, 19);
  } catch (error) {
    console.error('Error en obtenerFinDia:', error, { fechaLocal, zonaHoraria });
    return `${fechaLocal} 23:59:59`;
  }
};