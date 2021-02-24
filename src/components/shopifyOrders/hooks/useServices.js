import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useServices = (secretKey) => {
  const [isServiceLoading, setLoading] = useState(true)
  const [services, setServices] = useState([])

  useEffect(() => {
    if (secretKey) {
      const getServices = async () => {
        const token = localStorage.getItem('token')

        const response = await axios.get(`${ROOT_URL}/order/service/`,
          {
            params: {
              secret_key: secretKey,
              new: true
            }
          },
          { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
        )
        setServices(response.data)
        setLoading(false)
      }
      getServices()
    }
  }, [secretKey])

  return [services, isServiceLoading]
}

export default useServices