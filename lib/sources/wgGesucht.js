const FlatFinder = require('lib/flatfinder')
const config = require('conf/config.json')
const utils = require('lib/utils')

function getUrl(flatType) {
  const { city, cityKey, minSize, maxRent } = config.providers.wggesucht
  const { wantedDistricts } = config

  const url =
    'https://www.wg-gesucht.de/wohnungen-in-' +
    city +
    '.' +
    cityKey +
    '.' +
    flatType +
    '.1.0.html'

  const qs = {
    offer_filter: 1,
    city_id: cityKey,
    stadt_key: cityKey,
    radAdd: (wantedDistricts || []).map((d) => d.replace(/\s/g, '+')).join(','),
    sort_column: 0,
    category: flatType,
    autocompinp: city,
    rent_type: 2,
    sMin: minSize,
    rMax: maxRent,
    radDis: 0,
    wgFla: 0,
    wgSea: 0,
    wgSmo: 0,
    wgMnF: 0,
    wgMxT: 0,
    sin: 0,
    exc: 0,
    hidden_rmMin: 0,
    hidden_rmMax: 0,
    pet: 0,
    fur: 2,
  }

  return url + utils.objectToQuerystring(qs)
}

function normalize(o) {
  const id = parseInt(o.id.split('-').pop())

  const details = o.details.split(' Verfügbar: ab ')
  const address = details[0].split(' in ')[1]

  const sizePrice = o.sizePrice.split(' | ')
  const size = sizePrice[0]
  const price = sizePrice[1]

  return { ...o, id, size, price, address }
}

function applyFilter(o) {
  const wishDistrict = utils.isOneOf(o.address, config.wantedDistricts)
  const notBlacklisted = !utils.isOneOf(o.title, config.blacklist)

  return wishDistrict && notBlacklisted
}

const createFinder = (name, flatType) => {
  const enabled = !!config.providers.wggesucht

  const source = {
    name: name,
    enabled,
    url: !enabled || getUrl(flatType),
    crawlContainer:
      '#main_column .panel.panel-default:not(.panel-hidden):not(.noprint)',
    crawlFields: {
      id: '@id',
      sizePrice:
        '.detail-size-price-wrapper .detailansicht | removeNewline | trim',
      title: '.headline.printonly .detailansicht | removeNewline | trim',
      link: '.headline.printonly .detailansicht@href',
      details: '.row p | removeNewline | trim',
    },
    paginate: 'nav .pagination li:last-of-type a@href',
    normalize: normalize,
    filter: applyFilter,
  }

  return new FlatFinder(source)
}

const studioFinder = createFinder('wgGesucht.studioFlat', 1)
const normalFinder = createFinder('wgGesucht.normalFlat', 2)

module.exports = {
  run: () => Promise.all([studioFinder.run(), normalFinder.run()]),
}
