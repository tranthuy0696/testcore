export function getChunkArray(array: Array<any>, size: number): Array<Array<any>> {
  let chunkArray = []
  for (let i = 0, n = array.length; i < n; i += size) {
    let chunk = array.slice(i, i + size)
    chunkArray.push(chunk)
  }
  return chunkArray
}
