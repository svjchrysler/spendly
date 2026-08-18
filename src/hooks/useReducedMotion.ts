import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * `prefers-reduced-motion`. El CSS ya se apaga solo con la regla global de
 * `index.css`; esto es para lo que anima JavaScript (count-up, recharts, la
 * pista de swipe), que esa regla no alcanza.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
