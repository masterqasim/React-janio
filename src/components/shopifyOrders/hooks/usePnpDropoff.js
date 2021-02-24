import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const usePnpDropoff = (secretKey) => {
  const [parkers, setParkers] = useState([])

  useEffect(() => {
      const getParkers = async () => {
        console.log('getting parkers...')
        const token = localStorage.getItem('token')
        const response = await axios.get(`${ROOT_URL}/partner/pnp-parkers/`, {
          headers: { 'Content-Type': 'application/json',
                     'Authorization': 'Token ' + token }
        })
        setParkers(response.data)
      }
      getParkers()
  }, [])

  return parkers
}

export default usePnpDropoff