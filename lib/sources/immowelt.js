const FlatFinder = require('lib/flatfinder')
const config = require('conf/config.json')
const utils = require('lib/utils')

function normalize(o) {
  const size = o.size.split('Wohnfläche (ca.)')[1]
  const price = o.price + ' €'
  const address = o.address

  return Object.assign(o, { size, address, price })
}

function applyBlacklist(o) {
  const titleNotBlacklisted = !utils.isOneOf(o.title, config.blacklist)
  const descNotBlacklisted = !utils.isOneOf(o.description, config.blacklist)

  return titleNotBlacklisted && descNotBlacklisted
}

const enabled = !!config.providers.immowelt

const immowelt = {
  name: 'immowelt',
  enabled,
  url: !enabled || config.providers.immowelt.url,
  crawlContainer: '.immoliste .js-object.listitem_wrap ',
  crawlFields: {
    id: '@data-estateid | int',
    price: '.hardfacts_3 .price_rent strong | removeNewline | trim | int',
    size:
      '.hardfacts_3 div:nth-child(2):not(.hardfactlabel)| removeNewline | trim',
    title: '.listcontent.clear h2',
    link: 'a@href',
    description: '.listconten_offset .listmerkmale| removeNewline | trim',
    address: '.listlocation | removeNewline | trim',
  },
  paginate: '.pagination #nlbPlus@href',
  normalize: normalize,
  filter: applyBlacklist,
}

module.exports = new FlatFinder(immowelt)
