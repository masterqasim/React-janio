import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useCities = (countries) => {
  const [isCitiesLoading, setLoading] = useState(true)
  const [cities, setCities] = useState([])

  useEffect(() => {
    const getCities = async () => {
      const response = await axios.get(`${ROOT_URL}/location/cities/${countries ? "?countries="+countries :""}`
      )
      setCities(response.data)
      setLoading(false)
    }
    getCities()
  }, [])

  return [cities, isCitiesLoading]
}

export default useCities