const dateFormat = (date: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']
  const y = date.substr(0, 4),
    d = date.substr(8, 2),
    t = date.substr(11, 5)

  const m = months[parseInt(date.substr(5, 2)) - 1]

  return d + ' ' + m + ' ' + y + ', ' + t
}

export default dateFormat
