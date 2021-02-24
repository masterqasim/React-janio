import React from "react"
import Lottie from "react-lottie"
import Animation from "./data"

const Loader = ({ height, width }) => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: Animation.Loader
  }

  return (
    <div className={'loader-container'}>
      <Lottie options={defaultOptions} height={height} width={width} />
    </div>
  )
}

export default Loader