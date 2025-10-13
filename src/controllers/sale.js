import { validateSale } from "../schemas/sales.js"
import { convertirFecha } from "../services/dateService.js"

export class SaleController {
  constructor({ saleModel }) {
    this.saleModel = saleModel
  }

  getAll = async (req, res) => {
    try {
      const zonaHoraria = req.headers["timezone"] || "America/Lima";
      const { startDate, endDate } = req.query;

      if (startDate && endDate) {
        const formattedStartDate = convertirFecha(startDate + " 00:00:00", zonaHoraria)
        const formattedEndDate = convertirFecha(endDate + " 23:59:59", zonaHoraria)
        const sales = await this.saleModel.getAll({ startDateModel: formattedStartDate, endDateModel: formattedEndDate });

        const salesConvertidas = sales.map(sale => ({
          ...sale,
          fecha_venta: convertirFecha(sale.fecha_venta, zonaHoraria),
        }));
        return res.json(salesConvertidas);
      }
      const sales = await this.saleModel.getAll({ startDateModel: startDate, endDateModel: endDate });
      const salesConvertidas = sales.map(sale => ({
        ...sale,
        fecha_venta: convertirFecha(sale.fecha_venta, zonaHoraria),
      }));

      return res.json(salesConvertidas);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener las ventas" });
    }
  };

  getById = async (req, res) => {
    const { id } = req.params
    const sale = await this.saleModel.getById({ id })
    if (sale) {
      return res.json(sale)
    }
    return res.status(404).json({ message: "Venta no encontrada" })
  }

  create = async (req, res) => {
    const { id } = req.user
    if (!id) {
      return res.status(403).json({ message: 'Access denied' })
    }
    const result = validateSale(req.body)
    if (result.error) {
      const errors = result.error.issues.map(issue => issue.message);
      return res.status(400).json(errors)
    }
    const newSale = await this.saleModel.create({ input: result.data, id })
    if (newSale) {
      return res.status(201).end()
    }
    return res.status(404).json({ message: "Venta no encontrada" })
  }

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      
      if (!id) {
        return res.status(400).json({ message: "ID de venta es requerido" });
      }
      
      // Verificar si la venta existe y obtener el ID del usuario
      const sale = await this.saleModel.getById({ id });
      if (!sale) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
      
      // Verificar permisos
      if (sale.userId !== userId) {
        return res.status(403).json({ message: "No tienes permisos para eliminar esta venta" });
      }
      
      // Eliminar la venta
      const result = await this.saleModel.delete({ id });
      
      if (result && result.message) {
        return res.status(200).json({ message: result.message });
      }
      
      return res.status(200).json({ message: "Venta eliminada correctamente" });
      
    } catch (error) {
      console.error("Error eliminando la venta:", error);
      return res.status(500).json({ 
        message: "Error interno del servidor",
        error: error.message 
      });
    }
  };
}