import { useState, useEffect } from 'react'
import axios from 'axios'

const useCountryCode = country => {
  const [countryCode, setCountryCode] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {  
    const getPhoneNumberCode = async () => {
      setLoading(true)
      const response = await axios.get(
        `/api/data/phone-number/country-codes/?country=${country}`, {
        headers: { 'Content-Type': 'application/json'}
      })
      const countryData = response.data[0]
      setCountryCode(countryData)
      setLoading(false)
    }
    if (country){
      getPhoneNumberCode()
    }
  }, [country])

  return [countryCode, loading]
}

export default useCountryCode