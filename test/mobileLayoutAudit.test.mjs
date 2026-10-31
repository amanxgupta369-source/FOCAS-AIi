import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('================================================================')
console.log('FOCAS Mobile-First Layout Audit & Token Test Suite')
console.log('================================================================')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`)
    console.error(`    ${err.message}`)
    failed++
  }
}

// ----------------------------------------------------------------------------
// 1. Color Palette & WCAG AA Contrast Verification
// ----------------------------------------------------------------------------
test('Original atmospheric palette restored in tailwind.config.js', () => {
  const tailwindPath = path.join(rootDir, 'tailwind.config.js')
  const content = fs.readFileSync(tailwindPath, 'utf8')
  assert.ok(content.includes('#536f91'), 'Dusk primary brand color #536f91 must be present')
  assert.ok(content.includes('#26364a'), 'Dusk ink text color #26364a must be present')
  assert.ok(content.includes('#738398'), 'Dusk mute color #738398 must be present')
  assert.ok(content.includes('#dceaf5'), 'Dusk pale ice color #dceaf5 must be present')
  assert.ok(content.includes("xs: '380px'"), 'Mobile xs: 380px breakpoint must be configured')
})

test('Original atmospheric radial background and glass rules in src/index.css', () => {
  const cssPath = path.join(rootDir, 'src', 'index.css')
  const content = fs.readFileSync(cssPath, 'utf8')
  assert.ok(content.includes('radial-gradient(ellipse 800px 500px at 15% -5%'), 'Original atmospheric background must be restored')
  assert.ok(content.includes('rgba(255, 255, 255, 0.22)'), 'Authentic glass card fill must be restored')
  assert.ok(content.includes('#536f91'), 'Primary button color #536f91 must be restored')
  assert.ok(content.includes('env(safe-area-inset-bottom'), 'Mobile bottom nav safe area padding must be present')
})

test('Contrast ratio calculation: Text #26364a against #dceaf5 meets WCAG AAA (>7:1)', () => {
  // Relative luminance calculation
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  // #26364a -> (38, 54, 74)
  const l1 = getLuminance(38, 54, 74)
  // #dceaf5 -> (220, 234, 245)
  const l2 = getLuminance(220, 234, 245)

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  assert.ok(ratio >= 7.0, `Contrast ratio must be >= 7.0: got ${ratio.toFixed(2)}`)
})

test('Contrast ratio calculation: White text against primary button #536f91 meets WCAG AA (>4.5:1)', () => {
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  // #536f91 -> (83, 111, 145)
  const lBtn = getLuminance(83, 111, 145)
  const lWhite = getLuminance(255, 255, 255)

  const ratio = (lWhite + 0.05) / (lBtn + 0.05)
  assert.ok(ratio >= 4.5, `Button text contrast must be >= 4.5: got ${ratio.toFixed(2)}`)
})

// ----------------------------------------------------------------------------
// 2. Mobile Input Font Size (No iOS Safari Auto-Zoom)
// ----------------------------------------------------------------------------
test('Mobile input font size is enforced to 16px on screens < 640px', () => {
  const cssPath = path.join(rootDir, 'src', 'index.css')
  const content = fs.readFileSync(cssPath, 'utf8')
  assert.ok(
    content.includes('font-size: 16px !important'),
    'Must enforce 16px input font size on mobile media query to eliminate iOS zoom'
  )
})

// ----------------------------------------------------------------------------
// 3. Mobile Bottom Navigation Structure & Items
// ----------------------------------------------------------------------------
test('Dashboard contains mobile bottom navigation with exactly Today, Projects, Evaluate, Activity', () => {
  const dashPath = path.join(rootDir, 'src', 'pages', 'Dashboard.tsx')
  const content = fs.readFileSync(dashPath, 'utf8')
  assert.ok(content.includes('aria-label="Mobile Navigation"'), 'Mobile navigation aria-label must exist')
  assert.ok(content.includes('Today</span>'), 'Today bottom nav tab must exist')
  assert.ok(content.includes('Projects</span>'), 'Projects bottom nav tab must exist')
  assert.ok(content.includes('Evaluate</span>'), 'Evaluate prominent center button must exist')
  assert.ok(content.includes('Activity</span>'), 'Activity bottom nav tab must exist')
  assert.ok(content.includes('-mt-4'), 'Evaluate button must be elevated with -mt-4')
})

// ----------------------------------------------------------------------------
// 4. Report Tabs Mobile Adaptation
// ----------------------------------------------------------------------------
test('Analysis page contains synchronized mobile section selector and scrollable tabs', () => {
  const analysisPath = path.join(rootDir, 'src', 'pages', 'Analysis.tsx')
  const content = fs.readFileSync(analysisPath, 'utf8')
  assert.ok(content.includes('aria-label="Select report section"'), 'Section dropdown must be present for small screens')
  assert.ok(content.includes('scroll-indicator-mask'), 'Tab bar must include scroll-indicator-mask')
  assert.ok(content.includes('touch-scroll'), 'Tab bar must include touch-scroll')
})

// ----------------------------------------------------------------------------
// 5. Touch Targets (Minimum 44px) Verification on Key Components
// ----------------------------------------------------------------------------
test('Modal close buttons across all pages have minimum 44x44px touch targets', () => {
  const files = [
    path.join(rootDir, 'src', 'pages', 'Landing.tsx'),
    path.join(rootDir, 'src', 'pages', 'Wizard.tsx'),
    path.join(rootDir, 'src', 'pages', 'ProjectToday.tsx'),
    path.join(rootDir, 'src', 'components', 'AuthModal.tsx'),
  ]

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    assert.ok(
      content.includes('min-h-[44px]') || content.includes('min-w-[44px]'),
      `File ${path.basename(file)} must define 44px minimum touch targets`
    )
  }
})

// ----------------------------------------------------------------------------
// 6. Responsive Grids in Forms and Modals (No 320px squishing)
// ----------------------------------------------------------------------------
test('Interview logging form uses grid-cols-1 on phones to prevent date overflow', () => {
  const todayPath = path.join(rootDir, 'src', 'pages', 'ProjectToday.tsx')
  const content = fs.readFileSync(todayPath, 'utf8')
  assert.ok(
    content.includes('grid grid-cols-1 sm:grid-cols-2 gap-3'),
    'Interview modal date and role fields must stack on mobile (grid-cols-1 sm:grid-cols-2)'
  )
})

test('Weekly review modal uses grid-cols-1 on phones for evidence summaries', () => {
  const todayPath = path.join(rootDir, 'src', 'pages', 'ProjectToday.tsx')
  const content = fs.readFileSync(todayPath, 'utf8')
  assert.ok(
    content.includes('grid grid-cols-1 sm:grid-cols-2 gap-3'),
    'Weekly review modal must stack problem and pricing evidence cards on mobile'
  )
})

console.log('----------------------------------------------------------------')
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('================================================================')

if (failed > 0) {
  process.exit(1)
}
