import { useState, useEffect } from 'react'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const distance = (lat1, lon1, lat2, lon2) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    return dist * 1.609344;
  }
}

const usePnpDropoff = (secretKey) => {
  const [parkers, setParkers] = useState([])

  useEffect(() => {  
      const getParkers = async () => {
        console.log('getting parkers...')
        const token = localStorage.getItem('token')
        const response = await axios.get(`${ROOT_URL}/partner/pnp-parkers/`, {
          headers: { 'Content-Type': 'application/json',
                     'Authorization': 'Token ' + token }
        })
        if (navigator.geolocation) {
          let long, lat = null
          navigator.geolocation.getCurrentPosition((position)=>{
            long = position.coords.longitude
            lat = position.coords.latitude
            response.data.sort((a,b) => (distance(lat, long, a.lat, a.long) - distance(lat, long, b.lat, b.long)))
            setParkers(response.data)
          },(error) =>{
            console.log('Rejected',error)
            setParkers(response.data)
          });
        } else {
          console.log('Geolocation is not supported by this browser.')
        }
      }
      getParkers()
  }, [])

  return parkers
}

export default usePnpDropoff