import React from 'react'
import PropTypes from 'prop-types'
import Popup from 'reactjs-popup'


const CustomPopUp = (props) => {
  return(
    <Popup
      trigger={<i className="far fa-sm fa-question-circle ml-2"></i>}
      position="bottom left"
      open={props.isOpen}
      contentStyle={{
        width: 280,
        borderRadius: "5px",
        boxShadow: "5px 5px 15px darkgrey",
        borderWidth: 0
      }}
    >
      <div className="d-flex flex-column align-content-center">
        <label className="ml-3 mr-3" style={{ fontSize: 13 }}>
          {props.message}
        </label>
      </div>
    </Popup>
  )
}

CustomPopUp.propTypes = {
  message: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired
}

export default CustomPopUp
