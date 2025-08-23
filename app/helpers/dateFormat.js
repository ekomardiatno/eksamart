const dateFormat = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']
  let y = date.substr(0, 4),
    m = date.substr(5, 2),
    d = date.substr(8, 2),
    t = date.substr(11, 5),
    dateTime = null

  m = months[parseInt(m) - 1]

  return d + ' ' + m + ' ' + y + ', ' + t
}

export default dateFormat