const $ = (s) => document.querySelector(s)
const text = $('#text'), fg = $('#fg'), bg = $('#bg')
const genBtn = $('#generateBtn'), dlBtn = $('#downloadBtn'), copyBtn = $('#copyBtn')
const box = $('#qrcode'), stage = $('#stage'), field = $('#field')
let size = 300
let hasQR = false

function toast(message, type = 'ok') {
  const el = document.createElement('div')
  el.className = 'toast ' + type
  el.textContent = message
  $('#toasts').appendChild(el)
  setTimeout(() => el.classList.add('out'), 2200)
  setTimeout(() => el.remove(), 2700)
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function contrast(a, b) {
  const l1 = lum(a), l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function draw() {
  box.innerHTML = ''
  new QRCode(box, {
    text: text.value.trim(),
    width: size,
    height: size,
    colorDark: fg.value,
    colorLight: bg.value,
    correctLevel: QRCode.CorrectLevel.H,
  })
  stage.classList.add('has-qr')
  box.classList.remove('pop')
  void box.offsetWidth
  box.classList.add('pop')
  hasQR = true
  dlBtn.disabled = false
  copyBtn.disabled = false
}

function generate() {
  if (!text.value.trim()) {
    field.classList.remove('shake')
    void field.offsetWidth
    field.classList.add('shake')
    toast('Enter some text or a URL first', 'err')
    text.focus()
    return
  }
  genBtn.classList.add('loading')
  setTimeout(() => {
    draw()
    genBtn.classList.remove('loading')
    if (contrast(fg.value, bg.value) < 3) toast('Low contrast: this code may not scan', 'warn')
    else toast('QR code ready')
  }, 450)
}

function padded() {
  const source = box.querySelector('canvas')
  if (!source) return null
  const margin = 28
  const out = document.createElement('canvas')
  out.width = source.width + margin * 2
  out.height = source.height + margin * 2
  const ctx = out.getContext('2d')
  ctx.fillStyle = bg.value
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(source, margin, margin)
  return out
}

function download() {
  const out = padded()
  if (!out) return
  const link = document.createElement('a')
  link.href = out.toDataURL('image/png')
  link.download = 'qrcode.png'
  link.click()
  toast('Downloaded qrcode.png')
}

async function copy() {
  const out = padded()
  if (!out) return
  try {
    const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/png'))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    toast('Copied to clipboard')
  } catch {
    toast('Copy is not supported in this browser', 'err')
  }
}

function refresh() {
  $('#fgHex').textContent = fg.value
  $('#bgHex').textContent = bg.value
  if (hasQR) draw()
}

$('#seg').addEventListener('click', (e) => {
  const b = e.target.closest('button')
  if (!b) return
  document.querySelectorAll('#seg button').forEach((x) => x.classList.remove('on'))
  b.classList.add('on')
  size = Number(b.dataset.size)
  if (hasQR) draw()
})

$('#presets').addEventListener('click', (e) => {
  const b = e.target.closest('button')
  if (!b) return
  fg.value = b.dataset.fg
  bg.value = b.dataset.bg
  refresh()
})

fg.addEventListener('input', refresh)
bg.addEventListener('input', refresh)
genBtn.addEventListener('click', generate)
dlBtn.addEventListener('click', download)
copyBtn.addEventListener('click', copy)
text.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate()
})

const root = document.documentElement
try {
  root.dataset.theme = localStorage.getItem('theme-v2') || 'dark'
} catch {
  root.dataset.theme = 'dark'
}
$('#themeBtn').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
  root.dataset.theme = next
  try {
    localStorage.setItem('theme-v2', next)
  } catch {
    /* ignore */
  }
})

