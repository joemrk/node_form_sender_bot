import puppeteer from 'puppeteer'



export const RebootPuppeteer = async (domainOptions) => {

  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()

  //fix if page contain modal form 
  //fix if site have two pages

  try {
    await page.goto(`http://${domainOptions.domain}`, {
      waitUntil: 'networkidle2'
    })

    const handlersResult = await pageHandler(page, domainOptions)

    await browser.close()

    return handlersResult

  } catch (e) {
    return new Error(`RebootPuppeteer: ${e}`)
    // throw new Error(`RebootPuppeteer: ${e}`)
  }
}


async function pageHandler(page, domainOptions, pageCounter = 0) {
  await page.waitForSelector('body')
  const callCounter = pageCounter

  if (pageCounter < 2) {
    const pageForms = await page.$$('form')

    const withoutModals = pageForms.filter(f => {
      if (!f._remoteObject.description.includes('popup') && !f._remoteObject.description.includes('modal'))
        return f
    })

    for await (let form of withoutModals) {
      await formHandler(form, domainOptions)
      await page.waitForNavigation()

      const pageUrl = page.url()

      if (pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain))
        return true
      else if (pageUrl.includes(domainOptions.domain))
        return await pageHandler(page, domainOptions, callCounter + 1)
    }
  }
}

async function formHandler(form, domainOptions) {
  let notFindFieldCounter = 0
  for await (let field of domainOptions.form.fields) {
    const checkForField = await form.$(field.selector)
    if (checkForField) {
      await checkForField.evaluate(el => el.value = '')
      await checkForField.click()
      await checkForField.type(field.value)
    } else notFindFieldCounter++
  }

  if (notFindFieldCounter === domainOptions.form.fields.length) return new Error(`Not found any fields of domain on page.`)

  const checkForSubmitBtn = await form.$(domainOptions.form.submit)
  if (!checkForSubmitBtn) return new Error(`Submit button not found on page.`)
  await checkForSubmitBtn.click()
}


async function setFromValues(page, domainOptions, form, pageCounter = 0) {
  const callCounter = pageCounter

  if (callCounter < 3) {
    let notFindFieldCounter = 0

    await page.waitForSelector('body')

    for await (let field of domainOptions.form.fields) {
      const checkForField = await form.$(field.selector)
      if (checkForField) {
        await checkForField.click()
        await checkForField.type(field.value)
        // await page.click(field.selector)
        // await page.keyboard.type(field.value)
      } else notFindFieldCounter++
    }

    //if on page not found fields of domain, return err
    if (notFindFieldCounter === domainOptions.form.fields.length) return new Error(`Not found any fields of domain on page.`)

    const checkForSubmitBtn = await form.$(domainOptions.form.submit)
    if (checkForSubmitBtn) {
      await checkForSubmitBtn.click()
      await page.waitForNavigation()
    }
    else return new Error(`Submit button not found on page.`)


    const pageUrl = page.url()

    if (pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain))
      return true
    else if (pageUrl.includes(domainOptions.domain))
      return await setFromValues(page, domainOptions, callCounter + 1)

  } else return false

}