import React from "react"
import { Modal } from "antd"
import { ClipLoader } from "react-spinners"

const ModalLoading = props => {
  return (
    <Modal visible={props.visible} centered closable={false} footer={null} maskClosable={false} width={120}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <ClipLoader size={40} />
        <p style={{marginBottom: 0, marginTop: 16, textAlign: 'center'}}>{props.text || 'Loading...'}</p>
      </div>
    </Modal>
  )
}

export default ModalLoading