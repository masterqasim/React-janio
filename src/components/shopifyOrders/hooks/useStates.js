import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useStates = (country) => {
  const [state, setStates] = useState({states:[],statesLoading:true})

  useEffect(() => {  
    const getstates = async () => {
      console.log('getting states...')
      const response = await axios.get(`${ROOT_URL}/location/states/?countries=${country}`, {
        headers: { 'Content-Type': 'application/json'}
      })
      const states = response.data.sort(function(a, b){
        var stateA = a.state_name.toLowerCase(), stateB = b.state_name.toLowerCase()
        if (stateA < stateB) //sort string ascending
            return - 1 
        if (stateA > stateB)
            return 1
        return 0 
      })
      setStates({states: response.data, statesLoading:false})
    }
    if (country){
      getstates()
    }
  }, [country])

  return [state.states, state.statesLoading]
}

export default useStates