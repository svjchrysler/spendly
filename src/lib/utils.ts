import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
  La escala tipográfica de iOS (`text-body`, `text-subhead`…) es propia del
  tema: sin declararla, tailwind-merge la toma por un color y, al combinar
  `text-subhead` con `text-primary`, borraba uno de los dos.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "large-title",
            "title-1",
            "title-2",
            "title-3",
            "headline",
            "body",
            "callout",
            "subhead",
            "footnote",
            "caption-1",
            "caption-2",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
