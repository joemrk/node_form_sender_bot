import axios from 'axios'
import CryptoJS from 'crypto-js'
import querystring from 'query-string'
import dotenv from 'dotenv'

const result = dotenv.config() 
if (result.error) {
  throw result.error
}


const user = process.env.CRM_USER
const password = process.env.CRM_PASS
const apiKey = process.env.CRM_API_KEY


let authToken = ''

function getRandomArbitrary() {
    return Math.random() * (99999999 - 1000000) + 1000000;
}

const request = axios.create({
    baseURL: `https://${process.env.CRM_URL}/api/v_2/crm/`,
    headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
    },

})

const Auth = async () => {
    try {
        const rand = getRandomArbitrary()
        const key = CryptoJS.MD5(apiKey + rand).toString()
        const requestData = {
            key: key,
            rand_param: rand,
            login: user,
            password: password,
        }
        const stringParams = querystring.stringify(requestData)
        authToken = await request.post('/Login', stringParams).then(res => res.data.values.auth_token)
    } catch (error) {
        throw new Error(error)
    }
}

export const GetClientsList = async (options = {}) => {
    try {
        await Auth()
        if (authToken) {

            const rand = getRandomArbitrary()
            const key = CryptoJS.MD5(apiKey + rand).toString()
            const limit = options.limit || 50
            const offset = options.offset * limit || 0

            const patternCheck = JSON.stringify({
                name: "",
                fields: {
                    0: "full_name",
                    1: "email",
                    2: "phone",
                    3: "country_id",
                    4: "creation_date",
                    5: "first_action_date",
                    6: "additionalField21"
                },
                filters: {},
                sorting: {}
            })
            const requestData = {
                admin_pattern_id: '',
                auth_token: authToken,
                ignoreClientIds: '[]',
                key: key,
                keyword: '',
                limit: limit,
                offset: offset,
                pattern_check: patternCheck,
                rand_param: rand,
                sorting_field: JSON.stringify({
                    creation_date: 1
                }),
                use_pattern: 'true',
                user_pattern_id: '',
            }
            const stringParams = querystring.stringify(requestData)
            const data = await request.get(`/GetClientsList?${stringParams}`).then(res => res.data)
            if (data.result === 'success') {
                return JSON.parse(data.values)
            }
        }
    } catch (error) {
        throw new Error(error)
    }
}




//offers
// id:1 - 'Общее Дело'
// id:2 - 'Код Успеха'
// id:3 - 'Залетный'
// id:4 - 'Код Успеха (pro)'
// id:5 - 'Pattern Trader'
// id:6 - 'Profit Maximizer'
// id:7 - 'Bitcoin Union - EN'
// id:8 - 'Cotyzien50'
// id:9 - 'Intresting'
// id:11 - 'RU Intrest'
// id:12 - 'Intresting EN'
// id:13 - 'Quantum Systems'
// id:14 - 'Bitcoin PL'