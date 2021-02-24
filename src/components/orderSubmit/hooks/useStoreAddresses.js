import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions';

const useStoreAddresses = () => {
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const getAddresses = async () => {
      const url = `${ROOT_URL}/shipper/pickup-point/`
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json',
                   'Authorization': 'Token ' + token }
      })
      setAddresses(response.data)
    }
    getAddresses()
  }, [])

  return addresses
}

export default useStoreAddresses