import { validateItem, validatePartialItem } from "../schemas/items.js"

export class ItemController {
  constructor({ itemModel }) {
    this.itemModel = itemModel
  }

  getAll = async (req, res) => {
    const { categoria } = req.query
    const items = await this.itemModel.getAll({ categoria })
    return res.json(items)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const item = await this.itemModel.getById({ id })
    if (item) {
      return res.json(item)
    }
    return res.status(404).json({ message: "Producto no encontrado" })
  }

  create = async (req, res) => {
    const result = validateItem(req.body)
    if (result.error) {
      const errors = result.error.issues.map(issue => issue.message);
      return res.status(400).json(errors)
    }
    const newItem = await this.itemModel.create({ input: result.data })
    return res.status(201).json(newItem)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.itemModel.delete({ id })
    if (result===false) {
      return res.status(404).json({ message: "No se encontró el producto" })
    }
    return res.status(204).json({ message: "Producto eliminado" })
  }

  update = async (req, res) => {
    const result = validatePartialItem(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { id } = req.params
    const updatedItem = await this.itemModel.update({ id, input: result.data })
    if (updatedItem) {
      return res.json(updatedItem)
    }
    return res.status(404).json({ message: "Producto no encontrado" })
  }
}