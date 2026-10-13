import { z } from "zod";

export const siteContentSchema = z.object({
  homeOverline: z.string().trim().min(2).max(160),
  homeTagline: z.string().trim().min(2).max(250),
  homeButton: z.string().trim().min(2).max(100),
  manifestoEyebrow: z.string().trim().min(2).max(160),
  manifestoText: z.string().trim().min(5).max(2000),
  featuredEyebrow: z.string().trim().min(2).max(160),
  featuredTitle: z.string().trim().min(2).max(100),
  sportsEyebrow: z.string().trim().min(2).max(160),
  sportsTitle: z.string().trim().min(2).max(100),
  sportsDescription: z.string().trim().min(5).max(1200),
  sportsButton: z.string().trim().min(2).max(100),
  closingEyebrow: z.string().trim().min(2).max(160),
  closingTitle: z.string().trim().min(2).max(160),
  closingButton: z.string().trim().min(2).max(100),
  catalogEyebrow: z.string().trim().min(2).max(160),
  catalogTitle: z.string().trim().min(2).max(100),
  catalogDescription: z.string().trim().min(5).max(500),
  movementEyebrow: z.string().trim().min(2).max(160),
  movementTitle: z.string().trim().min(2).max(200),
  movementIntroFirst: z.string().trim().min(5).max(1200),
  movementIntroSecond: z.string().trim().min(5).max(1200),
  processEyebrow: z.string().trim().min(2).max(160),
  processTitle: z.string().trim().min(2).max(120),
  processDescription: z.string().trim().min(5).max(1200),
  recognitionEyebrow: z.string().trim().min(2).max(160),
  recognitionTitle: z.string().trim().min(2).max(120),
  recognitionDescription: z.string().trim().min(5).max(1200),
  movementClosingEyebrow: z.string().trim().min(2).max(160),
  movementClosingTitle: z.string().trim().min(2).max(120),
  movementClosingDescription: z.string().trim().min(5).max(500),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const defaultSiteContent: SiteContent = {
  homeOverline: "PROHIBIDO ARROJAR",
  homeTagline: "Ropa rescatada.\nHistorias que vuelven.",
  homeButton: "EXPLORAR EMPARCHADAS",
  manifestoEyebrow: "DECLARACIÓN DE PRINCIPIOS / SIN PERMISO",
  manifestoText:
    "Resistimos las reglas de la moda, y sus industrias, aprendemos en comunidad, recuperamos prendas, y transformamos lo que otros descartan. EMPARCHAMOS, CREAMOS Y ENCONTRAMOS NUEVAS FORMAS DE HABITAR EL MUNDO, ESTO ES EMPARCHADA, ESTO ES BASURA, BASURA ES MOVIMIENTO",
  featuredEyebrow: "OBJETOS CON OTRA VIDA",
  featuredTitle: "EMPARCHADAS",
  sportsEyebrow: "UN GRITO COLECTIVO",
  sportsTitle: "LA PLATA\nSPORTS",
  sportsDescription:
    "BASURA ganó el desfile de moda La Plata Sports. No fue una meta: fue una prueba de que lo que se hace en comunidad también ocupa el centro de la escena.",
  sportsButton: "CONOCÉ LA HISTORIA",
  closingEyebrow: "NO ES DESECHO. ES POSIBILIDAD.",
  closingTitle: "EMPARCHAR\nES RESISTIR.",
  closingButton: "BASURA ES MOVIMIENTO",
  catalogEyebrow: "PRENDAS RESCATADAS / PIEZAS ÚNICAS",
  catalogTitle: "EMPARCHADAS.",
  catalogDescription:
    "Lo que otros dejaron atrás, acá encuentra otra forma. Explorá, elegí y consultanos por WhatsApp.",
  movementEyebrow: "LA PLATA, ARGENTINA / CULTURA EN MOVIMIENTO",
  movementTitle: "NO VENIMOS A SEGUIR LAS REGLAS. VENIMOS A REMENDARLAS.",
  movementIntroFirst:
    "BASURA nace de mirar de nuevo aquello que la industria decidió descartar. Una prenda usada no es una historia terminada: es tela, memoria y posibilidad. La recuperamos, la intervenimos y la ponemos otra vez en movimiento.",
  movementIntroSecond:
    "Emparchar es una práctica y una postura. Es aprender haciendo, compartir herramientas, dejar visible la costura y encontrar belleza en lo que no busca parecer perfecto. Cada pieza se trabaja con tiempo; por eso ninguna es exactamente igual a otra.",
  processEyebrow: "EL PROCESO NO SE ESCONDE",
  processTitle: "LA COSTURA TAMBIÉN CUENTA.",
  processDescription:
    "Seleccionamos prendas recuperables, observamos sus marcas y decidimos en comunidad cómo pueden seguir. Parches, bordados y costuras visibles no tapan el pasado: lo suman a una nueva historia. Acá vamos a compartir talleres, procesos y encuentros a medida que sucedan.",
  recognitionEyebrow: "LA PLATA SPORTS / RECONOCIMIENTO COLECTIVO",
  recognitionTitle: "GANAR TAMBIÉN ES ABRIR ESPACIO.",
  recognitionDescription:
    "BASURA ganó el desfile de moda La Plata Sports. Celebramos ese reconocimiento como una conquista compartida y una oportunidad para que más miradas se acerquen a la moda recuperada, independiente y hecha en comunidad. El movimiento sigue: se transforma con cada persona que se suma.",
  movementClosingEyebrow: "VENÍ A VER QUÉ SE ESTÁ MOVIENDO",
  movementClosingTitle: "SEGUÍ LA HUELLA.",
  movementClosingDescription:
    "Las novedades y convocatorias se comparten en los canales oficiales de BASURA.",
};
