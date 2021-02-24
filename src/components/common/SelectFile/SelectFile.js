import React, { useRef, useState, useEffect } from 'react'
import prettyBytes from 'pretty-bytes'

import './style.scss'

const SelectFile = props => {
  const inputFileRef = useRef()
  const [file, setFile] = useState()
  const [fileUrl, setFileUrl] = useState()

  const onClick = e => {
    inputFileRef.current.click()
  }
  useEffect(() => {
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }, [file])
  
  const onChange = e => {
    const file = e.target.files[0]
    setFile(file)
    if (props.onChange) {
      props.onChange(file || '')
    }
  }

  return (
    <div className={props.isError ? "file-uploader-container has-error":"file-uploader-container"} onClick={onClick}>
      <div className="file-uploader-box">
        <input className="file-uploader-file" type="file" ref={inputFileRef} onChange={onChange} />

        {!file ?
        <div className="file-uploader-nofile">
          <p className="file-uploader-title">Click here to browse your files</p>
          <p className="file-uploader-help">Max 3MB of PDF or image (jpeg, jpg, png) file can be uploaded</p>
        </div>
        :
        <div className="file-uploader-hasfile">
          {fileUrl ? 
            <div className="file-preview" style={{backgroundImage: `url(${fileUrl})`}}></div>
            :
            <div className="file-preview"></div>
          }
          <div className="file-description">
            <p className="file-name" title={file.name}>{file.name}</p>
            <p className="file-size">{prettyBytes(file.size)}</p>
          </div>
        </div>
        }
      </div>
    </div>
  )
}

export default SelectFile