import { GetClientsList } from './parser.js'
import { RebootPuppeteer } from './puppeteer.js'


(async () => {

	const domains = [
		'maximaf1xifer.pl',
		'maxmalixifxer.pl',
		'maxxifmizer.pl'
	]

	const domainsAdvanced = genDomainEmails(domains)

	const checkFormSubmitResult = await Promise.all(domainsAdvanced.map(d => checkFormSubmit(d)))
	const checkFullResult = await checkCrm(checkFormSubmitResult)

	checkFullResult.forEach(r => {
		if (r.form && r.crm) console.log(r.domain, true);
		else console.log(r.domain, r.message)
	})
	

}
)()



async function checkCrm(domainAdvanced) {
	const limit = Math.floor(domainAdvanced.length + (domainAdvanced.length / 2))
	const crmResult = await GetClientsList({ limit: limit })
	if (crmResult.length > 0) {
		return domainAdvanced.map(d => {
			if (crmResult.some(l => {
				if (l.email === d.email) return true
				else return false
			})) return { ...d, crm: true }
			else return { ...d, messages:`${d.messages}; Lead not exist` }
		})
	}
}

async function checkFormSubmit(domainAdvanced) {
	const puppeteer = await RebootPuppeteer(domainAdvanced.domain, domainAdvanced.email)

	if (puppeteer.includes('thanks.php')) return { ...domainAdvanced, form: true }
	else if (!puppeteer) return { ...domainAdvanced, puppeteerResult: 'Puppeteer have error' }
}


function genDomainEmails(domains) {
	return domains.map(d => { return { domain: d, email: `${genRandomString(7)}@gmail.com`, messages: '', form: false, crm: false } })
}

function genRandomString(n) {
	let abc = "abcdefghijklmnopqrstuvwxyz";
	let rs = "";
	while (rs.length < n) rs += abc[Math.floor(Math.random() * abc.length)];
	return rs
}
