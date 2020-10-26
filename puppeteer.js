import puppeteer from 'puppeteer'

export const RebootPuppeteer = async (domainOptions) => {

  const browser = await puppeteer.launch({
    // headless: false
  })

  const page = await browser.newPage()

  try {
    await page.goto(`http://${domainOptions.domain}`, {
      waitUntil: 'networkidle2'
    })
    await page.waitForSelector('body')

    for await(let domain of domainOptions.form.fields) {
      await page.click(domain.selector)
      await page.keyboard.type(domain.value)
    }

    await page.click(domainOptions.form.submit)
    await page.waitForNavigation()

    await browser.close()

    return page.url()

  } catch (e) {
    return false
  }
}