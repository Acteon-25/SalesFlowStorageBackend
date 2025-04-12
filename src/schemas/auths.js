import z from "zod"

const registerSchema = z.object({
  username: z.string({
    required_error: "El campo username es obligatorio"
  }).min(3, {
    message: "Al menos 3 caracteres"
  }).max(30),
  email: z.string({
    required_error: "El campo correo electrónico es obligatorio"
  }).email({
    message: "Tener un formato válido como ejemplo@correo.com"
  }
  ),
  password: z.string({
    required_error: "El campo contraseña es obligatorio"
  }).min(8, {
    message: "Al menos 8 caracteres"
  }).max(30)
    .regex(/[A-Z]/, "Al menos una mayúscula")
    .regex(/[a-z]/, "Al menos una minúscula")
    .regex(/\d/, "Al menos un número")
    .regex(/[@$!%*?&]/, "Al menos un carácter especial"),
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
  }).min(8).max(30),
})

export function validateLogin(object) {
  return loginSchema.safeParse(object)
}