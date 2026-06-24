export type Usuario = {
  id_usuario:     number
  correo:         string
  clave:          string
  estado:         boolean
  id_rol:         number
  es_admin_base?: boolean
}

export type CreateUsuarioDto = Omit<Usuario, 'id_usuario' | 'es_admin_base'>
export type UpdateUsuarioDto = Omit<Partial<CreateUsuarioDto>, 'clave'>

export type BackendUsuario = {
  id_usuario:     number
  correo:         string
  estado:         boolean
  role?:          { id_rol: number } | null
  es_admin_base?: boolean
}
