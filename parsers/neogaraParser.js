import axios from 'axios'
import { NEOGARA_AUTH_TOKEN, NEOGARA_CRM_URL } from '../consts.js'


const request = axios.create({
  baseURL: NEOGARA_CRM_URL,
  headers: {
    "accept": "application/json",
    "authorization": `Bearer ${NEOGARA_AUTH_TOKEN}`,
  }
})

export const NeogaraGetConversions = async (options ={}) =>{
  try {
    const limit = parseInt(options.limit) || 10
    const data = await request.get(`conversions?limit=${limit}&page=1&sort%5B0%5D=id%2CDESC&offset=0`).then(res => {return res.data.data})
    return data.map(l => {return l.lid.email})

  } catch (error) {
    return error
  }
}


// (async ()=>{
//   console.log(await NeogaraGetConversions({limit: 10}));
  
// })()