import { GetClientsList } from './parser.js'
import { RebootPuppeteer } from './puppeteer.js'
import dotenv from 'dotenv'


const result = dotenv.config() 
if (result.error) {
  throw result.error
}
 
(async () => {

	// const domains = [
	// 	'paetretlren.info',
	// 	'pagtfrdeqtren.info',
	// 	'partrestcrketen.info',
	// 	'patjreoteren.info'
	// ]

	// const domainsAdvanced = genDomainEmails(domains)

	// const checkFormSubmitResult = await Promise.all(domainsAdvanced.forEach(d => checkFormSubmit(d)))

	// const checkFullResult = await checkCrm(checkFormSubmitResult)

	// for(let domain of checkFullResult){
	// 	console.log(domain.domain, domain.crm);
	// }
	


}
)()



async function checkCrm(domainAdvanced) {
	const limit = domainAdvanced.length + (domainAdvanced.length / 2)
	const crmResult = await GetClientsList({ limit: limit })
	if (crmResult.length > 0) {
		return domainAdvanced.forEach(d => {
			if (crmResult.some(l => {
				if (l.email === d.email) return true
				else return false
			})) return { ...d, crm: true }
		})
	}
}

async function checkFormSubmit(domainAdvanced) {
	const puppeteer = await RebootPuppeteer(domainAdvanced.domain, domainAdvanced.email)
	if (puppeteer.includes('thanks.php')) return { ...domainAdvanced, form: true }
	else if (!puppeteer) return { ...domainAdvanced, puppeteerResult: 'Puppeteer have error' }
}


function genDomainEmails(domains) {
	return domains.map(d => { return { domain: d, email: `${genRandomString(7)}@gmail.com`, puppeteerResult: '', form: false, crm: false } })
}

function genRandomString(n) {
	let abc = "abcdefghijklmnopqrstuvwxyz";
	let rs = "";
	while (rs.length < n) rs += abc[Math.floor(Math.random() * abc.length)];
	return rs
}
