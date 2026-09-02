// src/features/dashboard/utils/landing.ts
// Constantes/datos estáticos de LandingPage — separados del componente para
// que la página no cargue con datos que no cambian entre renders.

export const EASE = [0.22, 1, 0.36, 1] as const

export const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

// ─── Pasos del proceso ────────────────────────────────────────────────────────
export const PASOS = [
  {
    n: '01',
    titulo: 'Consulta',
    descripcion: 'Discutimos tu visión, la historia de la pieza y tus preferencias para encontrar el ajuste perfecto.',
  },
  {
    n: '02',
    titulo: 'Selección',
    descripcion: 'Elige entre nuestra colección curada de maderas finas, texturas y soportes de calidad museística.',
  },
  {
    n: '03',
    titulo: 'Artesanía Manual',
    descripcion: 'Nuestros maestros artesanos construyen y terminan meticulosamente tu proyecto a mano en el taller.',
  },
]

export const CLD = 'https://res.cloudinary.com/dq1etaydx/image/upload'
export const HERO_IMG = `${CLD}/f_auto,q_auto,w_900/v1774138848/landingPagehero_euzx3s.png`

export const CARD_IDS = [
  'v1774138848/landingPage1_assbrk.png',
  'v1774138846/landingPage2restauracion_wpcpl8.png',
  'v1774138847/landingPage3pinturas_y7uwxs.png',
  'v1774138847/landingPage4decoracion_clyg0c.png',
  'v1774138846/landingPage2enmarcacion_ubu86c.png',
]

export function cldCard(id: string) {
  const base = `${CLD}/f_auto,q_auto,c_fill,g_auto`
  return {
    src:    `${base},w_400,h_300/${id}`,
    srcSet: `${base},w_400,h_300/${id} 400w, ${base},w_800,h_600/${id} 800w`,
  }
}

export const NAV_LINKS: [string, string][] = [
  ['Inicio',    '#inicio'],
  ['Servicios', '#servicios'],
  ['Proceso',   '#proceso'],
  ['Contacto',  '#contacto'],
]

export const MAP_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1589.1411649985575!2d-75.5900702757797!3d6.26116392340876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e44290015ff5b7d%3A0x17b7e0f09ebe520e!2zQXJ0ZUNhZsOp!5e0!3m2!1ses-419!2sco!4v1777095655596!5m2!1ses-419!2sco'
