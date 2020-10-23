import puppeteer from 'puppeteer'

export const RebootPuppeteer = async (targetPage, testEmail) => {

  const browser = await puppeteer.launch({
    // headless: false
  })

  const page = await browser.newPage()

  try {
    await page.goto(`http://${targetPage}`, {
      waitUntil: 'networkidle2'
    })
    await page.waitForSelector('body')

    await page.click('input[name=firstname]')
    await page.keyboard.type('test')

    await page.click('input[name=lastname]')
    await page.keyboard.type('test')

    await page.click('input[name=phone_number]')
    await page.keyboard.type('111111')

    await page.click('input[name=email]')
    await page.keyboard.type(testEmail)

    await page.click('*[type=submit]')
    await page.waitForNavigation()

    await browser.close()

    return page.url()

  } catch (e) {
    return false
  }
}