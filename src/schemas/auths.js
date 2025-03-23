import z from "zod"

const registerSchema = z.object({
  username: z.string({
    required_error: "El campo username es obligatorio"
  }).min(3, {
    message: "El username debe tener al menos 3 caracteres"
  }).max(30),
  email: z.string({
    required_error: "El campo email es obligatorio"
  }).email({
    message: "El email no es valido"
  }
  ),
  password: z.string({
    required_error: "El campo password es obligatorio"
  }).min(6, {
    message: "El password debe tener al menos 6 caracteres"
  }).max(30),
})

export function validateRegister(object) {
  return registerSchema.safeParse(object)
}

const loginSchema = z.object({
  email: z.string({
    required_error: "El campo email es obligatorio"
  }).email({
    message: "El email no es valido"
  }
  ),
  password: z.string({
    required_error: "El campo password es obligatorio"
  }).min(6,{
    message: "El password debe tener al menos 6 caracteres"
  }).max(30),
})

export function validateLogin(object) {
  return loginSchema.safeParse(object)
}