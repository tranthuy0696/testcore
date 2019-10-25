export function ipSort(a: string, b: string) {
  let x: any[number] = a.split('.')
  let y: any[number] = b.split('.')
  for (let i = 0; i < x.length; i++) {
    if ((x[i] = parseInt(x[i], 10)) < (y[i] = parseInt(y[i], 10))) {
      return -1
    } else if (x[i] > y[i]) {
      return 1
    }
  }
  return 0
}
