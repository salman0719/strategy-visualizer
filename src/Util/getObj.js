export default function getObj(data, keyName) {
  let obj = {}
  data.forEach((item) => {
    obj[keyName ? item[keyName] : item] = item
  })
  return obj
}
