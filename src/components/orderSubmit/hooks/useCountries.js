import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useCountries = (deps=[]) => {
  const [countries, setCountries] = useState([])

  useEffect(() => {
    const getCountries = async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${ROOT_URL}/data/places/`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
      setCountries(response.data)
    }
    getCountries()
  }, deps)

  return countries
}

export default useCountries