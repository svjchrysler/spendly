/* Boot theme before paint — no inline script (CSP script-src 'self'). */
(() => {
  try {
    const stored = localStorage.getItem('spendly-theme')
    let theme = 'light'
    if (stored === 'light' || stored === 'dark') {
      theme = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark'
    }
    document.documentElement.classList.toggle('dark', theme === 'dark')
    const darkMeta = document.querySelector(
      'meta[name="theme-color"][media*="prefers-color-scheme: dark"]',
    )
    const lightMeta = document.querySelector(
      'meta[name="theme-color"][media*="prefers-color-scheme: light"]',
    )
    const color =
      theme === 'dark'
        ? darkMeta?.getAttribute('content')
        : lightMeta?.getAttribute('content')
    if (color) {
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.setAttribute('content', color)
      })
    }
  } catch {
    /* ignore */
  }
})()
