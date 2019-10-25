export function naturalSort(items: any[], field: string | number, reverse: boolean) {
  return items.sort((a, b) => {
    if (reverse) {
      return compare(a[field], b[field], { insensitive: true })
    } else {
      return compare(b[field], a[field], { insensitive: true })
    }
  })
}

const zero = '0'.charCodeAt(0)
const plus = '+'.charCodeAt(0)
const minus = '-'.charCodeAt(0)

function isWhitespace(code: number) {
  return code <= 32
}

function isDigit(code: number) {
  return 48 <= code && code <= 57
}

function isSign(code: number) {
  return code === minus || code === plus
}

function value(v: any, opts: any) {
  let a = v
  if (a == null) {
    a = ''
  }
  if (typeof a === 'string') {
    a = a.trim()
    if (opts.insensitive) {
      a = String(a).toLowerCase()
    }
  }
  return a
}

function compare(v1: any, v2: any, opts: any) {
  let a = value(v1, opts)
  let b = value(v2, opts)
  if (typeof opts !== 'object') {
    opts = {}
  }
  opts.sign = !!opts.sign
  let checkSign = opts.sign
  let ia = 0
  let ib = 0
  let ma = a.length
  let mb = b.length
  let ca, cb // character code
  let za, zb // leading zero count
  let na, nb // number length
  let sa, sb // number sign
  let ta, tb // temporary
  let bias

  while (ia < ma && ib < mb) {
    ca = a.charCodeAt(ia)
    cb = b.charCodeAt(ib)
    za = zb = 0
    na = nb = 0
    sa = sb = true
    bias = 0

    // skip over leading spaces
    while (isWhitespace(ca)) {
      ia += 1
      ca = a.charCodeAt(ia)
    }
    while (isWhitespace(cb)) {
      ib += 1
      cb = b.charCodeAt(ib)
    }

    // skip and save sign
    if (checkSign) {
      ta = a.charCodeAt(ia + 1)
      if (isSign(ca) && isDigit(ta)) {
        if (ca === minus) {
          sa = false
        }
        ia += 1
        ca = ta
      }
      tb = b.charCodeAt(ib + 1)
      if (isSign(cb) && isDigit(tb)) {
        if (cb === minus) {
          sb = false
        }
        ib += 1
        cb = tb
      }
    }

    // compare digits with other symbols
    if (isDigit(ca) && !isDigit(cb)) {
      return -1
    }
    if (!isDigit(ca) && isDigit(cb)) {
      return 1
    }

    // compare negative and positive
    if (!sa && sb) {
      return -1
    }
    if (sa && !sb) {
      return 1
    }

    // count leading zeros
    while (ca === zero) {
      za += 1
      ia += 1
      ca = a.charCodeAt(ia)
    }
    while (cb === zero) {
      zb += 1
      ib += 1
      cb = b.charCodeAt(ib)
    }

    // count numbers
    while (isDigit(ca) || isDigit(cb)) {
      if (isDigit(ca) && isDigit(cb) && bias === 0) {
        if (sa) {
          if (ca < cb) {
            bias = -1
          } else if (ca > cb) {
            bias = 1
          }
        } else {
          if (ca > cb) {
            bias = -1
          } else if (ca < cb) {
            bias = 1
          }
        }
      }
      if (isDigit(ca)) {
        ia += 1
        na += 1
        ca = a.charCodeAt(ia)
      }
      if (isDigit(cb)) {
        ib += 1
        nb += 1
        cb = b.charCodeAt(ib)
      }
    }
    // compare number length
    if (sa) {
      if (na < nb) {
        return -1
      }
      if (na > nb) {
        return 1
      }
    } else {
      if (na > nb) {
        return -1
      }
      if (na < nb) {
        return 1
      }
    }
    // compare numbers
    if (bias) {
      return bias
    }

    // compare leading zeros
    if (sa) {
      if (za > zb) {
        return -1
      }
      if (za < zb) {
        return 1
      }
    } else {
      if (za < zb) {
        return -1
      }
      if (za > zb) {
        return 1
      }
    }

    // compare ascii codes
    if (ca < cb) {
      return -1
    }
    if (ca > cb) {
      return 1
    }

    ia += 1
    ib += 1
  }

  // compare length
  if (ma < mb) {
    return -1
  }
  if (ma > mb) {
    return 1
  }
}
