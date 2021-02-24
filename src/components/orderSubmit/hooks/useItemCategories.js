import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useItemCategories = () => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      const response = await axios.get(`${ROOT_URL}/data/item-categories/`)
      setCategories(response.data)
    }
    getCategories()
  }, [])

  return categories
}

export default useItemCategories