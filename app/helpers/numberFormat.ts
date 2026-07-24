const numberFormat = (value: number): string => {
  let minus = false
  let num = value
  if(num < 0) {
    minus = true
    num = num * -1
  }
  const str = num.toString()
  let rest = str.length % 3,
    newValue = str.substr(0, rest),
    thousand = str.substr(rest).match(/\d{3}/g),
    separator = ''
  if (thousand) {
    separator = rest ? ',' : ''
    newValue += separator + thousand.join(',')
  }

  return (minus ? '-' : '') + newValue
}
export default numberFormat
