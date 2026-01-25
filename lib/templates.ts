import rawTemplates from "@/data/templates.json"

export type TemplateId = string

export interface TemplateCardDefaults {
  title?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  backgroundColor?: string
  textColor?: string
  textContainerBackground?: string
  textContainerOpacity?: number
}

export interface TemplateConfig {
  id: TemplateId
  name: string
  category: string
  image: string
  free?: boolean
  card?: TemplateCardDefaults
}

export const templates = rawTemplates as TemplateConfig[]

function normalizeTemplateId(id: string): string {
  const trimmed = id.trim()
  if (!trimmed) return "DEFAULT"
  // user requested default name "DEFALT" (typo) - support it too
  if (trimmed.toUpperCase() === "DEFALT") return "DEFAULT"
  return trimmed
}

export function getTemplateById(templateId: string): TemplateConfig | undefined {
  const normalized = normalizeTemplateId(templateId)
  return templates.find((t) => t.id.toLowerCase() === normalized.toLowerCase())
}

export function getDefaultTemplate(): TemplateConfig {
  return getTemplateById("DEFAULT") ?? templates[0]
}

export function getTemplateCategories(): string[] {
  const set = new Set<string>()
  for (const t of templates) set.add(t.category)
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export interface EditCardDataForCreatePage {
  // intentionally no `id` for "create new"
  title: string
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: string
  backgroundColor: string
  backgroundImage?: string
  textColor?: string
  textContainerBackground?: string
  textContainerOpacity?: number
  templateId?: string
}

export function buildEditCardDataFromTemplate(templateId: string): EditCardDataForCreatePage {
  const tpl = getTemplateById(templateId) ?? getDefaultTemplate()
  const fallback = getDefaultTemplate()

  const merged: Required<Pick<
    EditCardDataForCreatePage,
    "title" | "text" | "fontSize" | "fontFamily" | "fontStyle" | "backgroundColor"
  >> &
    Pick<
      EditCardDataForCreatePage,
      "backgroundImage" | "textColor" | "textContainerBackground" | "textContainerOpacity" | "templateId"
    > = {
    title: tpl.card?.title ?? tpl.name ?? fallback.card?.title ?? "Greetings!",
    text: tpl.card?.text ?? fallback.card?.text ?? "Wishing you all the best!",
    fontSize: tpl.card?.fontSize ?? fallback.card?.fontSize ?? 24,
    fontFamily: tpl.card?.fontFamily ?? fallback.card?.fontFamily ?? "Arial",
    fontStyle: tpl.card?.fontStyle ?? fallback.card?.fontStyle ?? "normal",
    backgroundColor: tpl.card?.backgroundColor ?? fallback.card?.backgroundColor ?? "#fafafa",
    backgroundImage: tpl.image,
    textColor: tpl.card?.textColor ?? fallback.card?.textColor ?? "#ffffff",
    textContainerBackground: tpl.card?.textContainerBackground ?? fallback.card?.textContainerBackground ?? "#000000",
    textContainerOpacity: tpl.card?.textContainerOpacity ?? fallback.card?.textContainerOpacity ?? 0.6,
    templateId: tpl.id,
  }

  return merged
}

