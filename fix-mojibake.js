'use strict'
const fs   = require('fs')
const path = require('path')

const FIXES = [
  ['C3A2C593E280A6',                   'E29C85',             '✅'],
  ['C3A2C29DC592',                      'E29D8C',             '❌'],
  ['C3A2C5A1C2A1',                      'E29AA1',             '⚡'],
  ['C3A2C5A1C2A0C3AFC2B8C28F',          'E29AA0EFB88F',       '⚠️'],
  ['C3A2C5A1E284A2C3AFC2B8C28F',        'E29A99EFB88F',       '⚙️'],
  ['C3A2E282ACC2A2',                    'E280A2',             '(bullet)'],
  ['C3B0C5B8C5BDC2AF',                  'F09F8EAF',           '🎯'],
  ['C3B0C5B8E280BAC2A1C3AFC2B8C28F',    'F09F9BA1EFB88F',     '🛡️'],
  ['C3B0C5B8C2A7C2B9',                  'F09FA7B9',           '🧹'],
  ['C3B0C5B8E2809DC2A5',                'F09F94A5',           '🔥'],
  ['C3B0C5B8E2809DC28D',                'F09F948D',           '🔍'],
  ['C3B0C5B8E2809DC2A7',                'F09F94A7',           '🔧'],
  ['C3B0C5B8E2809DE2809E',              'F09F9484',           '🔄'],
  ['C3B0C5B8E2809CC2A6',                'F09F93A6',           '📦'],
  ['C3B0C5B8E28098C2A4',                'F09F92A4',           '💤'],
  ['C383E2809C',                        'C393',               'O-acute'],
  ['C383C5A1',                          'C39A',               'U-acute'],
  ['C383E280B0',                        'C389',               'E-acute'],
  ['C383C28D',                          'C38D',               'I-acute'],
]
FIXES.sort((a, b) => b[0].length - a[0].length)

function getAllTsFiles(dir, result) {
  result = result || []
  var SKIP = { node_modules:1, '.next':1, dist:1, '.git':1, coverage:1 }
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function(e) {
    var fp = path.join(dir, e.name)
    if (e.isDirectory()) { if (!SKIP[e.name]) getAllTsFiles(fp, result) }
    else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx')) result.push(fp)
  })
  return result
}

function replaceAll(buf, searchHex, replaceHex) {
  var search  = Buffer.from(searchHex,  'hex')
  var replace = Buffer.from(replaceHex, 'hex')
  var count = 0, parts = [], offset = 0
  while (true) {
    var idx = buf.indexOf(search, offset)
    if (idx === -1) { parts.push(buf.slice(offset)); break }
    parts.push(buf.slice(offset, idx))
    parts.push(replace)
    offset = idx + search.length
    count++
  }
  return { buf: count > 0 ? Buffer.concat(parts) : buf, count: count }
}

var srcDir = path.resolve(__dirname, 'src')
var files  = getAllTsFiles(srcDir)
var totalOcc = 0, totalFiles = 0

console.log('\nEscaneando ' + files.length + ' archivos...\n')

files.forEach(function(file) {
  var buf = fs.readFileSync(file)
  var changed = false, log = []
  FIXES.forEach(function(fix) {
    var r = replaceAll(buf, fix[0], fix[1])
    if (r.count > 0) {
      buf = r.buf; changed = true; totalOcc += r.count
      log.push('  ' + r.count + 'x ' + fix[2])
    }
  })
  if (changed) {
    fs.writeFileSync(file, buf); totalFiles++
    console.log('FIXED: ' + path.relative(__dirname, file))
    log.forEach(function(l) { console.log(l) })
  }
})
console.log('\n--- ' + totalOcc + ' ocurrencias en ' + totalFiles + ' archivos ---')
