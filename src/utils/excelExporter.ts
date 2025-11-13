import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface SheetSpec {
  name: string
  headers: string[]
  rows: (string | number | boolean | null | undefined)[][]
}

// 自动计算列宽：基于表头和内容的最大长度
const calcColWidths = (headers: string[], rows: any[][]) => {
  const widths = headers.map(h => Math.max(8, String(h).length))
  rows.forEach(r => {
    r.forEach((cell, idx) => {
      const len = String(cell ?? '').length
      widths[idx] = Math.max(widths[idx] || 8, len)
    })
  })
  // 将字符宽度转换为Excel列宽（近似值）
  return widths.map(w => ({ wch: Math.min(40, Math.max(10, Math.ceil(w * 1.2))) }))
}

export const exportToExcel = (sheets: SheetSpec[], fileName: string) => {
  const wb = XLSX.utils.book_new()
  sheets.forEach(spec => {
    const data = [spec.headers, ...spec.rows]
    const ws = XLSX.utils.aoa_to_sheet(data)
    // 自动列宽
    ;(ws as any)['!cols'] = calcColWidths(spec.headers, spec.rows)
    XLSX.utils.book_append_sheet(wb, ws, spec.name)
  })
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
}

export default { exportToExcel }