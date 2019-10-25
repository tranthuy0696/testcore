export function generateNumberArray(min: number, max: number): Array<number> {
  let array = []
  for (let i = min, n = max; i <= n; i++) {
    array.push(i)
  }
  return array
}
