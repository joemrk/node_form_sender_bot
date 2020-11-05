import puppeteer from 'puppeteer'



export const RebootPuppeteer = async (domainOptions) => {

  const browser = await puppeteer.launch({
    headless: false
  })

  //fix if page contain modal form 
  //fix if site have two pages  ++

  try {
    // const handlersResult = await pageHandler(page, domainOptions)
    const handlersResult = await openNewPagesForEachForm(browser, null, domainOptions)

    await browser.close()

    return handlersResult

  } catch (e) {
    console.log(e);

    return new Error(`RebootPuppeteer: ${e}`)
  }
}


async function getPageFormsWithoutModals(page) {
  let formsWithoutModals = []
  const pageForms = await page.$$('form')
  for await (let form of pageForms) {
    const formParents = await form.evaluate(f => {
      let a = f
      let els = [];
      while (a) {
        els.unshift(a.className)
        a = a.parentNode
      }
      return els.join(' ')
    })
    if (!formParents.includes('popup') && !formParents.includes('modal'))
      formsWithoutModals.push(form)
  }
  return formsWithoutModals
}

async function openNewPagesForEachForm(browser, url = null, domainOptions) {
  const page = await browser.newPage()
  await page.goto(url || `http://${domainOptions.domain}`, { waitUntil: 'networkidle2' })

  const formsOnPage = await getPageFormsWithoutModals(page)

  if (formsOnPage.length === 0) return new Error(`Not modal form not found`)
  if (formsOnPage.length === 1) {
    await formHandler(formsOnPage[0], domainOptions)
    const checkUrlResult = await checkUrl(browser, page, domainOptions)
      return checkUrlResult
  }
  else {
    for await (let form of formsOnPage) {
      await formHandler(form, domainOptions)
      const checkUrlResult = await checkUrl(browser, page, domainOptions)
      return checkUrlResult
    }
  }
}

async function checkUrl(browser, page, domainOptions) {
  await page.waitForNavigation()
  // await page.waitForTimeout(3000)
  const pageUrl = page.url()

  if (pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain)) {
    return true
  }
  else if (!pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain)) {
    return await openNewPagesForEachForm(browser, pageUrl, domainOptions)
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
  if (!checkForSubmitBtn || checkForSubmitBtn === null) return new Error(`Submit button not found on page.`)
  await checkForSubmitBtn.click()
}

async function pageHandler(page, domainOptions, pageCounter = 0) {
  await page.waitForSelector('body')

  if (pageCounter < 2) {
    const pageForms = await page.$$('form')

    for await (let form of pageForms) {
      const formParents = await form.evaluate(f => {
        let a = f
        let els = [];
        while (a) {
          els.unshift(a.className)
          a = a.parentNode
        }
        return els.join(' ')
      })


      if (!formParents.includes('popup') && !formParents.includes('modal')) {
        await formHandler(form, domainOptions)

        await page.waitForNavigation()

        const pageUrl = page.url()

        if (pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain))
          return true
        else if (!pageUrl.includes('thanks.php') && pageUrl.includes(domainOptions.domain))
          return await pageHandler(page, domainOptions, pageCounter + 1)
      }
    }
  }
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