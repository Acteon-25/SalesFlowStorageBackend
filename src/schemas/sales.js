import z from "zod"

const saleSchema = z.object({
  producto_id: z.string().uuid({
    message: "El producto debe ser seleccionado"
  }),
  cantidad: z.number({
    required_error: "La cantidad es obligatoria"
  }).int().positive({
    message: "La cantidad debe ser un número entero positivo"
  })
});

export function validateSale(object) {
  return saleSchema.safeParse(object)
}

export function validatePartialSale(input) {
  return saleSchema.partial().safeParse(input)
}