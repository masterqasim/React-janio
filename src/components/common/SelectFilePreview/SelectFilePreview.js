import React, { useState } from "react";
import { Upload, Spin, Icon } from "antd";
import prettyBytes from 'pretty-bytes';
import defaultFileIcon from "./secure_data_icon.svg"

const SelectFilePreview = props => {
  const [file, setFile] = useState();
  const [fileUrl, setFileUrl] = useState();
  const [fileUrlLoading, setFileUrlLoading] = useState(false);

  const handleFileChange = selectedFile => {
    setFileUrlLoading(true);
    setFile(selectedFile);

    let reader = new FileReader();
    reader.onloadend = () => {
      setFileUrl(reader.result);
      setFileUrlLoading(false);
      if (props.onChange) {
        props.onChange(selectedFile || '');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  let content
  if (fileUrlLoading) {
    content = <Spin />
  } else if (!!file && !fileUrlLoading) {
    const previewStyle = {
      width: 80,
      height: 80,
      backgroundSize: "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      border: "1px solid #eee",
      borderRadius: 4,
      padding: 3,
      flexShrink: 0,
      flexGrow: 0,
    }
    if (fileUrl && file.type.includes("image")) {
      previewStyle.backgroundImage = `url(${ fileUrl })`
    } else {
      previewStyle.backgroundImage = `url(${ defaultFileIcon })`
    }

    content = (
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 8px"
      }}>
        <div style={previewStyle}></div>
        <div style={{ marginLeft: 16, textAlign: 'left' }}>
          <p title={file.name}>{file.name}</p>
          <p style={{ fontSize: 11 }}>{prettyBytes(file.size)}</p>
        </div>
      </div>
    )
  } else {
    content = (
      <div>
        <p className="ant-upload-text">
          <Icon type="upload" style={{ verticalAlign: 'middle', fontSize: 16 }} />
          <p>Click&nbsp;</p><span>here</span><p>&nbsp;to browse your files</p>
        </p>
        <p className="ant-upload-hint" style={{fontSize: 12}}>
          Max 3MB of PDF or image (jpeg, jpg, png) file can be uploaded
        </p>
      </div>
    )
  }

  return (
    <Upload.Dragger
      className={props.hasError ? 'has-error': ''}
      beforeUpload={() => false}
      onChange={info => {
        handleFileChange(info.file);
      }}
      multiple={false}
      showUploadList={false}
      style={{
        overflow: "hidden"
      }}
      accept={props.accept || '*'}
    >
      {content}
    </Upload.Dragger>
  );
};

export default SelectFilePreview;
