import axios from 'axios'
import * as cheerio from 'cheerio'

export const scrap = async () => {
  const response = await axios.get(
    'https://ort-france.fr/ville/ort-montreuil/',
  )
  const html = response.data

  const $ = cheerio.load(html)

  $('div.jet-listing-grid__item').each((i, elem) => {
    const title = $(elem).find('h2').text()
    const subtitle = $(elem).find('h3').text()
    console.log(title, subtitle)
  })
}

scrap()
