export type LoginResponse = {
  success:      boolean
  message?:     string
  token:        string
  refreshToken: string
  data: {
    id_usuario: number
    correo:     string
    rol:        string
    id_cliente: number | null
    nombre?:    string | null
  }
}

export type AuthData = {
  token:        string
  refreshToken: string
  rol:          string
  id_usuario:   number
  correo:       string
  id_cliente?:  number | null
}
