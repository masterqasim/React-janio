import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useCurrencyMappings = (secretKey) => {
  const [state, setState] = useState({
    loading: true,
    data: []
  })

  const getCurrencies = async () => {
    const response = await axios.get(`${ROOT_URL}/data/country-currency-mappings/`,
      {headers: {
        'Content-Type': 'application/json'
      }}
    )
    setState({
      ...state, loading: false, data: response.data
    })
  }

  useEffect(() => {
    getCurrencies()
  }, [])

  return [state.data, state.loading]
}

export default useCurrencyMappings