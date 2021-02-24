import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'


const useServiceDef = (secretKey, additionalFilters) => {
  const [isServiceLoading, setLoading] = useState(true)
  const [serviceDefinitions, setServiceDefinitions] = useState([])

  useEffect(() => {
    if (secretKey) {
      const getServiceDefinitions = async () => {
        const token = localStorage.getItem('token')

        const response = await axios.get(`${ROOT_URL}/order/service-definitions/`,
          {
            params: {
              secret_key: secretKey,
              ...additionalFilters
            }
          },
          { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
        )
        setServiceDefinitions(response.data)
        setLoading(false)
      }
      getServiceDefinitions()
    }
  }, [secretKey])

  return [serviceDefinitions, isServiceLoading]
}

export default useServiceDef