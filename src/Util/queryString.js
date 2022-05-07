/*

  Inspired by the `qs` library.
  Accommodates few tweaks to fit certain application needs in a
  limited extent.

  `stringify`
    Parameters -
    `modifier`
      - An object which will be stringified to query search format
    `search`
      - `undefined` value is converted to current `location.search`
        So, by default current `location.search`` value is enhanced using
        this function
      - send `null` or empty value `''` to avoid building on top of
        current `location.search`

    Examples
      - qs.stringify({ id: 2 })
        If current `location.search == 'test=5'`, then the output
        would be `test=5&id=2`
      - qs.stringify({ test: undefined })
        If current `location.search == 'test=5&id=2'`, then the output
        would be `id=2` -> Removes the `test`
      - qs.stringify({ hello: 'world' }, null) (can replace `null` with
        `` (empty value) or `{}`)
        If current `location.search == 'test=5&id=2'`, then the output
        would be `hello=world` -> `location.search` remained unused
      - qs.stringify({ ids: [2, 3] })
        If current `location.search == 'ids=5'`, then the output
        would be `ids=5&ids=2&ids=3`

  `parse`
    Parameters -
    `search`
      - A string (or an object) converted to an object
      - If a key appears multiple times (ids=2&ids=3), then object
        considers the key value to be an array

*/

const location = window.location

const queryString = {
  stringify: (modifier, search) => {
    const searchParams = new URLSearchParams(
      search === undefined ? location.search : search || ''
    )

    modifier = modifier || {}

    for (const key in modifier) {
      let value = modifier[key]
      if (Array.isArray(value)) {
        searchParams.delete(key)
        value.forEach((item) => {
          searchParams.append(key, item)
        })
      } else if (value === undefined) {
        searchParams.delete(key)
        // } else if (searchParams.has(key)) {
        // 	searchParams.append(key, value)
      } else {
        searchParams.set(key, value)
      }
    }

    return searchParams.toString()
  },
  parse: (search) => {
    const searchParams = new URLSearchParams(
      search === undefined ? location.search : search || ''
    )

    let obj = {}

    for (const [key, value] of searchParams) {
      if (key in obj) {
        let prevValue = obj[key]
        if (!Array.isArray(prevValue)) {
          obj[key] = [prevValue]
        }
        obj[key].push(value)
      } else {
        obj[key] = value
      }
    }

    return obj
  }
}

export default queryString
