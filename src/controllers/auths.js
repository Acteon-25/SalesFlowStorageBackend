import { SECRET_KEY } from "../config.js"
import { validateRegister, validateLogin } from "../schemas/auths.js"

import jwt from "jsonwebtoken"

export class AuthController {
  constructor({ authModel }) {
    this.authModel = authModel
  }

  register = async (req, res) => {
    const result = validateRegister(req.body)
    if (result.error) {
      const fieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }
      return res.status(400).json({ message: fieldErrors })
    }
    const auths = await this.authModel.register({ input: result.data })
    if (auths.success) {
      return res.status(201).end()
    }
    return res.status(auths.status).json({ message: auths.message })
  }

  login = async (req, res) => {
    const result = validateLogin(req.body)
    if (result.error) {
      return res.status(400).json({ message: ["Las credenciales no son válidas. Intenta nuevamente."] })
    }
    const auths = await this.authModel.login({ input: result.data })
    if (auths.success === false) {
      if (auths.status === 404 || auths.status === 401) {
        return res.status(auths.status).json({ message: ["Las credenciales no son válidas. Intenta nuevamente."] })
      }
      return res.status(auths.status).json({ message: [auths.message] })
    }
    const token = jwt.sign(
      { id: auths.id, username: auths.username, email: auths.email },
      SECRET_KEY,
      {
        expiresIn: "1h"
      });
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 1000 * 60 * 60
    })
    return res.status(200).end();
  }

  logout = async (req, res) => {
    try {
      const auths = await this.authModel.logout(res)
      return res.status(200).json(auths)
    } catch (e) {
      return res.status(500).json({ message: "Error logging out" })
    }
  }

  profile = async (req, res) => {
    try {
      const { user } = req
      if (!user) {
        return res.status(403).json({ message: 'Access denied' })
      }
      const { id, username, email } = user

      return res.json({ id, username, email })
    } catch (e) {
      return res.status(500).json({ message: "Error getting profile" })
    }
  }
}