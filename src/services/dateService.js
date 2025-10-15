import { TZDate } from "@date-fns/tz";

// Convierte "2025-10-14" a "2025-10-14 00:00:00" en la zona horaria del usuario
// y luego a formato PostgreSQL timestamp
export const obtenerInicioDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    const timezoneOffsets = {
      'America/Lima': -5,
      'America/Bogota': -5,
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'America/Mexico_City': -6,
      'America/Argentina/Buenos_Aires': -3,
      'America/Sao_Paulo': -3,
      'Europe/Madrid': 1,
      'Europe/Paris': 1,
      'Europe/London': 0,
      'Asia/Tokyo': 9,
      'Asia/Shanghai': 8,
    };
    
    const offset = timezoneOffsets[zonaHoraria] || -5;
    
    const [year, month, day] = fechaLocal.split('-').map(Number);
    
    // Crear fecha UTC directamente
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // SUMAR el offset (no restar)
    // Lima UTC-5: 00:00 en Lima = 05:00 UTC
    // Entonces sumamos 5 horas (pero como es negativo, restamos el negativo = suma)
    const adjustedDate = new Date(utcDate.getTime() + (Math.abs(offset) * 60 * 60 * 1000));
    
    const utcYear = adjustedDate.getUTCFullYear();
    const utcMonth = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const utcHours = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');
    
    return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
  } catch (error) {
    console.error('Error en obtenerInicioDia:', error);
    throw error;
  }
};

export const obtenerFinDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    const timezoneOffsets = {
      'America/Lima': -5,
      'America/Bogota': -5,
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'America/Mexico_City': -6,
      'America/Argentina/Buenos_Aires': -3,
      'America/Sao_Paulo': -3,
      'Europe/Madrid': 1,
      'Europe/Paris': 1,
      'Europe/London': 0,
      'Asia/Tokyo': 9,
      'Asia/Shanghai': 8,
    };
    
    const offset = timezoneOffsets[zonaHoraria] || -5;
    
    const [year, month, day] = fechaLocal.split('-').map(Number);
    
    const utcDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    const adjustedDate = new Date(utcDate.getTime() + (Math.abs(offset) * 60 * 60 * 1000));
    
    const utcYear = adjustedDate.getUTCFullYear();
    const utcMonth = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(adjustedDate.getUTCDate()).padStart(2, '0');
    const utcHours = String(adjustedDate.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');
    
    return `${utcYear}-${utcMonth}-${utcDay} ${utcHours}:${utcMinutes}:${utcSeconds}`;
  } catch (error) {
    console.error('Error en obtenerFinDia:', error);
    throw error;
  }
};