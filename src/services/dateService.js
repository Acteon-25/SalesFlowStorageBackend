import { TZDate } from "@date-fns/tz";

// Obtiene el inicio del día en la zona horaria del usuario (00:00:00)
export const obtenerInicioDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    // fechaLocal viene como "2025-10-14"
    const fechaConHora = `${fechaLocal}T00:00:00`;
    const fecha = new TZDate(fechaConHora, zonaHoraria);
    
    // Convertir a formato que PostgreSQL entienda
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error en obtenerInicioDia:', error);
    throw error;
  }
};

// Obtiene el fin del día en la zona horaria del usuario (23:59:59)
export const obtenerFinDia = (fechaLocal, zonaHoraria = "America/Lima") => {
  try {
    const fechaConHora = `${fechaLocal}T23:59:59`;
    const fecha = new TZDate(fechaConHora, zonaHoraria);
    
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error en obtenerFinDia:', error);
    throw error;
  }
};