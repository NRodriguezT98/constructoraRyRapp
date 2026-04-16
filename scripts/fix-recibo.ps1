$f = 'D:\constructoraRyRapp\constructoraRyRapp\src\modules\abonos\components\recibo-pdf\ReciboAbonoPDF.tsx'
$lines = [System.IO.File]::ReadAllLines($f)
Write-Host "Total lines before: $($lines.Length)"

$before = $lines[0..550]
$lastIdx = $lines.Length - 1
$after  = $lines[587..$lastIdx]
$widthLine = '                          width: `${Math.min(100, Math.max(0, (((totalAbonado ?? 0) / valorTotal) * 100))).toFixed(1)}%`,'

$fix = @(
  '              </View>',
  '              {valorTotal && valorTotal > 0 ? (',
  '                <View style={styles.financieroPorcentaje}>',
  '                  <View style={styles.financieroPorcentajeHeader}>',
  '                    <Text style={styles.financieroPorcentajeEtiqueta}>',
  '                      Avance del pago:',
  '                    </Text>',
  '                    <Text style={styles.financieroPorcentajeValor}>',
  '                      {(((totalAbonado ?? 0) / valorTotal) * 100).toFixed(1)}%',
  '                      completado',
  '                    </Text>',
  '                  </View>',
  '                  <View style={styles.barraFondo}>',
  '                    <View',
  '                      style={[',
  '                        styles.barraRelleno,',
  '                        {',
  $widthLine,
  '                        },',
  '                      ]}',
  '                    />',
  '                  </View>',
  '                </View>',
  '              ) : null}'
)

$newLines = $before + $fix + $after
$newContent = $newLines -join "`n"
[System.IO.File]::WriteAllText($f, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Done. Lines after: $($newLines.Length)"
Write-Host "Line 552: $($newLines[551])"
