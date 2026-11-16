const text = document.querySelector('#text')
const sizeSel = document.querySelector('#size')
const fg = document.querySelector('#fg')
const bg = document.querySelector('#bg')
const generateBtn = document.querySelector('#generateBtn')
const downloadBtn = document.querySelector('#downloadBtn')
const qrBox = document.querySelector('#qrcode')
const msg = document.querySelector('#msg')

function generate() {
  const value = text.value.trim()
  if (!value) {
    msg.textContent = 'Please enter some text or a URL.'
    return
  }
  msg.textContent = ''
  qrBox.innerHTML = ''
  const size = Number(sizeSel.value)
  new QRCode(qrBox, {
    text: value,
    width: size,
    height: size,
    colorDark: fg.value,
    colorLight: bg.value,
    correctLevel: QRCode.CorrectLevel.H,
  })
  downloadBtn.disabled = false
}

function download() {
  const source = qrBox.querySelector('canvas')
  if (!source) return
  const margin = 24
  const out = document.createElement('canvas')
  out.width = source.width + margin * 2
  out.height = source.height + margin * 2
  const ctx = out.getContext('2d')
  ctx.fillStyle = bg.value
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(source, margin, margin)

  const link = document.createElement('a')
  link.href = out.toDataURL('image/png')
  link.download = 'qrcode.png'
  link.click()
}

generateBtn.addEventListener('click', generate)
downloadBtn.addEventListener('click', download)
text.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate()
})
