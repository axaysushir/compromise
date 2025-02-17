const parseDate = require('../../04-parse')

// these are dates that produce two seperate dates,
// and not a start-end range.
module.exports = [
  {
    // 'jan, or march 1999'
    match: '^during? #Month+ (or|and) #Month [<year>#Year]?',
    desc: 'march or june',
    parse: (m, context) => {
      let before = m.match('^during? [#Month]', 0)
      m = m.not('(or|and)')
      let start = parseDate(before, context)
      if (start) {
        let result = [
          {
            start: start,
            end: start.clone().end(),
            unit: start.unit,
          },
        ]
        // add more run-on numbers?
        let more = m.not(before)
        if (more.found) {
          more.match('#Month').forEach((month) => {
            let s = parseDate(month, context)
            // s.d = s.d.month(month.text('reduced'))
            result.push({
              start: s,
              end: s.clone().end(),
              unit: s.unit,
            })
          })
        }
        // apply the year
        let year = m.match('#Year$')
        if (year.found) {
          year = year.text('reduced')
          result.forEach((o) => {
            o.start.d = o.start.d.year(year)
            o.end.d = o.end.d.year(year)
          })
        }
        return result
      }
      return null
    },
  },
  {
    // 'jan 5 or 8'  - (one month, shared dates)
    match: '^#Month #Value+ (or|and)? #Value$',
    desc: 'jan 5 or 8',
    parse: (m, context) => {
      m = m.not('(or|and)')
      let before = m.match('^#Month #Value')
      let start = parseDate(before, context)
      if (start) {
        let result = [
          {
            start: start,
            end: start.clone().end(),
            unit: start.unit,
          },
        ]
        // add more run-on numbers?
        let more = m.not(before)
        if (more.found) {
          more.match('#Value').forEach((v) => {
            let s = start.clone()
            s.d = s.d.date(v.text('reduced'))
            result.push({
              start: s,
              end: s.clone().end(),
              unit: s.unit,
            })
          })
        }
        return result
      }
      return null
    },
  },
  {
    // 'jan 5, 8'  - (similar to above)
    match: '^#Month+ #Value #Value+$',
    desc: 'jan 5 8',
    parse: (m, context) => {
      let month = m.match('#Month')
      let year = m.match('#Year')
      m = m.not('#Year')
      let results = []
      m.match('#Value').forEach((val) => {
        let m = val.append(month)
        if (year.found) {
          m.append(year)
        }
        let start = parseDate(m, context)
        if (start) {
          results.push({
            start: start,
            end: start.clone().end(),
            unit: start.unit,
          })
        }
      })
      return results
    },
  },
  {
    // '5 or 8 of jan'  - (one month, shared dates)
    match: '^#Value+ (or|and)? #Value of #Month #Year?$',
    desc: '5 or 8 of Jan',
    parse: (m, context) => {
      let month = m.match('#Month')
      let year = m.match('#Year')
      m = m.not('#Year')
      let results = []
      m.match('#Value').forEach((val) => {
        let m = val.append(month)
        if (year.found) {
          m.append(year)
        }
        let start = parseDate(m, context)
        if (start) {
          results.push({
            start: start,
            end: start.clone().end(),
            unit: start.unit,
          })
        }
      })
      return results
    },
  },

  {
    // 'june or july 2019'
    match: '^!(between|from|during)? [<from>#Date+] (and|or) [<to>#Date+]$',
    desc: 'A or B',
    parse: (m, context) => {
      let fromDoc = m.groups('from')
      let toDoc = m.groups('to')
      let from = parseDate(fromDoc, context)
      let to = parseDate(toDoc, context)
      if (from && to) {
        // make their years agree....
        // if (toDoc.has('#Year') && !fromDoc.has('#Year') && from.d.isSame(to.d, 'year') === false) {
        //   from.d = from.d.year(to.d.year())
        // }
        return [
          {
            start: from,
            end: from.clone().end(),
          },
          {
            start: to,
            end: to.clone().end(),
          },
        ]
      }
      return null
    },
  },
]
