const fs = require('fs')
const { sum, max } = require('lodash')
const translate = require('@google-cloud/translate')
const translateClient = translate({
  keyFilename: './admin.json',
  projectId: 'converge18-mil-4001'
});

const data = fs.readFileSync('./results/plots_clean.json').toString().split('\n').map(r => {
  try {
    return JSON.parse(r)
  } catch(err) {
  }
})

const randomInArray = arr => {
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx]
}

const weightedRandomInArray = arr => {
  const totalSum = sum(arr.map(v => v[1]))
  const randomTotal = Math.floor(Math.random() * totalSum)
  let partialSum = 0
  let choice
  let idx = 0
  while (partialSum <= randomTotal) {
    choice = arr[idx][0]
    partialSum += arr[idx][1]
  }
  return choice
}

function Markov() {
  const self = this
  self.tree = {}
  self.starters = []
  self.train = (desc, weight = 1) => {
    const words = desc.split(/[\s"]/)
    if (words.length < 8) return
    const lowerCase = words.map(w => w.toLowerCase())
    lowerCase.forEach((_, idx) => {
      const jdx = idx + 1
      const base = lowerCase[idx]
      const next = lowerCase[jdx]
      if (idx === 0) {
        self.starters.push(base)
      }
      if (idx === lowerCase.length - 1) return
      const idxCouples = self.tree[base] || { [next]: 0 }
      self.tree[base] = idxCouples
      self.tree[base][next] = self.tree[base][next]
        ? self.tree[base][next] + weight
        : weight
    })
  }

  self.generate = async (length = 20) => {
    const first = randomInArray(self.starters)
    const text = [ first ]
    for (let i = 0; i < length; i++ ) {
      const word = text.slice(-1)[0]
      if (!self.tree[word]) {
        i = length
      } else {
        const nextChoices = Object.entries(self.tree[word]).sort((a, b) => {
          return a[1] < b[1] ? 1 : -1
        })
        // const next = randomInArray(nextChoices.map(a => a[0]))
        const next = randomInArray(nextChoices.slice(0,5).map(a => a[0]))
        // const next = weightedRandomInArray(nextChoices)
        text.push(next)
      }
    }
    const translated = await translateClient.translate(text.join(' '), 'it')
    const retranslated = await translateClient.translate(translated[0], 'en')
    const translations = {
      en: retranslated[0],
      it: translated[0]
    }
    return translations
  }

  return self
}

const m = Markov()

data.filter(d => d !== undefined).forEach(v => {
  m.train(v.plot, 1)
})

module.exports = m
