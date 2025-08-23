const numberFormat = (value) => {
  let minus = false
  if(value < 0) {
    minus = true
    value = value * -1
  }
  value = value.toString()
  let rest = value.length % 3,
    newValue = value.substr(0, rest),
    thousand = value.substr(rest).match(/\d{3}/g),
    separator = ''
  if (thousand) {
    separator = rest ? ',' : ''
    newValue += separator + thousand.join(',')
  }

  return (minus ? '-' : '') + newValue
}
export default numberFormat