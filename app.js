import { GetClientsList } from './parsers/globalmaxisParser.js'
import { RebootPuppeteer } from './puppeteer.js'
import Telegraf from 'telegraf'
import { BOT_TOKEN } from './consts.js'
import { NeogaraGetConversions } from './parsers/neogaraParser.js'

(async () => {

	const bot = new Telegraf(BOT_TOKEN)
	bot.start((ctx) => ctx.reply('Paste domain list with separator "\\n"'))
	bot.help((ctx) => ctx.reply('Paste domain list with separator "\\n"'))
	bot.on('text', async (ctx) => {
		ctx.reply('Process...')

		const domains = ctx.update.message.text.split('\n')

		const domainsAdvanced = wrapDomains(domains)
		const checkFormSubmitResult = await Promise.all(domainsAdvanced.map(d => checkFormSubmit(d)))
		const checkFullResult = await checkCrm(checkFormSubmitResult)
		

		const responseMessage = checkFullResult.map(r => {
			if (r.canSubmit && r.crm) return `${r.domain} 👍`
			else return `${r.domain} 😢 ${r.message.join('\n')}`
		})

		ctx.reply(responseMessage.join('\n'))
	})

	bot.launch()
})()



async function checkCrm(domainAdvanced) {

	const limit = Math.floor(domainAdvanced.length + (domainAdvanced.length / 2))
	const crmResult = await GetClientsList({ limit: limit })
	const neogaraResult = await NeogaraGetConversions({ limit: limit })


	const emails = [...crmResult, ...neogaraResult]
	if (emails.length > 0) {
		return domainAdvanced.map(d => {
			if (emails.some(l => {
				if (l === d.form.fields[3].value) return true
				else return false
			})) return { ...d, crm: true }
			else return { ...d, message: [...d.message, 'Lead not exist'] }
		})
	}
}

async function checkFormSubmit(domainAdvanced) {
	const puppeteer = await RebootPuppeteer(domainAdvanced)
	
	if (puppeteer) return { ...domainAdvanced, canSubmit: true }
	else if (puppeteer instanceof Error) return { ...domainAdvanced, message: [...domainAdvanced.message, puppeteer.message] }
	else return { ...domainAdvanced, message: [...domainAdvanced.message, 'Puppeteer have error'] }
}

function wrapDomains(domains) {
	return domains.map(d => {
		return {
			domain: d,
			message: [],
			canSubmit: false,
			crm: false,
			form: {
				fields: [
					{
						selector: 'input[name=firstname]',
						value: 'test'
					},
					{
						selector: 'input[name=lastname]',
						value: 'test'
					}, {
						selector: 'input[name=phone_number]',
						value: '11111111'
					}, {
						selector: 'input[name=email]',
						value: `${genRandomString(7)}@gmail.com`
					}],
				submit: '*[type=submit]'
			}
		}
	})
}

function genRandomString(n) {
	let abc = "abcdefghijklmnopqrstuvwxyz";
	let rs = "";
	while (rs.length < n) rs += abc[Math.floor(Math.random() * abc.length)];
	return rs
}