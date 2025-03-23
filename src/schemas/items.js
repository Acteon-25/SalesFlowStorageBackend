import z from "zod"

const itemSchema = z.object({
  nombre_producto: z.string({
    required_error: "El campo nombre es obligatorio"
  }).min(3).max(100),
  descripcion: z.string({
    required_error: "El campo descripcion es obligatorio"
  }).min(3).max(100),
  precio: z.number({
    required_error: "El campo precio es obligatorio"
  }).min(0),
  categoria: z.array(
    z.enum(["Cafes y Bebidas", "Bebidas Frias", "Panaderia", "Otros", "Accesorios y Complementos"]),
    {
      required_error: "El campo categoria es obligatorio"
    }
  )
})
export function validateItem(object) {
  return itemSchema.safeParse(object)
}

export function validatePartialItem(input) {
  return itemSchema.partial().safeParse(input)
}