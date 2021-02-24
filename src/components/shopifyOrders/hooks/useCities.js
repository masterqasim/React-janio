import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useCities = (country, states) => {
  const [state, setCities] = useState({cities:[],citiesLoading:true})

  useEffect(() => {  
    const getCities = async () => {
      console.log('getting cities...')
      const response = await axios.get(`${ROOT_URL}/location/cities/?countries=${country}&states=${states}`, {
        headers: { 'Content-Type': 'application/json'}
      })
      const cities = response.data.sort(function(a, b){
        var cityA = a.city_name.toLowerCase(), cityB = b.city_name.toLowerCase()
        if (cityA < cityB) //sort string ascending
            return - 1 
        if (cityA > cityB)
            return 1
        return 0 
      })
      setCities({cities: cities, citiesLoading:false})
    }
    if (country){
      getCities()
    }
  }, [country, states])

  return [state.cities, state.citiesLoading]
}

export default useCities