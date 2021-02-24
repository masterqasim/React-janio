import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import ReCaptcha from "react-google-recaptcha";
import { Formik, Form } from "formik";
import { CustomsDocumentContext } from "../CustomsDocument.context";
import { Card, Layout, Button, Row, Col, Alert, Input } from "antd";
import * as yup from "yup";
import { createFormData, documentTypeValidationMessage, documentTypeLabels } from "../utils";
import ModalLoading from "../../common/ModalLoading";
import SelectFilePreview from "../../common/SelectFilePreview";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/janio/raw/upload";
const acceptedFormats = 'application/pdf,image/*'

window.recaptchaOptions = {
  useRecaptchaNet: true,
}


const UploadDocuments = () => {
  const context = useContext(CustomsDocumentContext);
  const { customsDocuments, trackingNo } = context

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState();
  const [captcha, setCaptcha] = useState();

  const customsDocumentTypes = Object.keys(customsDocuments)
  console.log('customsDocumentTypes', customsDocumentTypes)

  let documentTypeSchema = {};
  let documentTypeInitialValue = {};

  const FILE_SIZE = 3 * 1024 * 1024;
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain"
  ];
  customsDocumentTypes.forEach(type => {
    if (type === 'website_link') {
      documentTypeSchema[type] = yup.string().required(
        documentTypeValidationMessage.website_link
      )
    } else {
      documentTypeSchema[type] = yup
        .mixed()
        .required(documentTypeValidationMessage[type])
        .test(
          "fileSize",
          "File too large",
          value => value && value.size <= FILE_SIZE
        )
        .test(
          "fileFormat",
          "Unsupported Format",
          value => value && SUPPORTED_FORMATS.includes(value.type)
        )
    }
    documentTypeInitialValue[type] = undefined;
  });

  useEffect(() => {
    const submitCustomsDocument = async () => {
      const response = await context.submitCustomsDocument(captcha);
      if (response.isError) {
        setUploadError("Something went wrong");
        setIsUploading(false);
      } else {
        context.setPage("success");
      }
    };

    if (uploadedFiles.length === customsDocumentTypes.length) {
      submitCustomsDocument();
    }
  }, [uploadedFiles]);

  const validationSchema = yup.object().shape({
    tracking_no: yup.string().required("Required"),
    // customs_document_requests: yup.object().shape(documentTypeSchema),
    captcha: yup.string().required("Please verify the captcha"),
    ...documentTypeSchema
  });

  const initialValues = {
    tracking_no: trackingNo,
    // customs_document_requests: documentTypeInitialValue,
    captcha: "",
    ...documentTypeInitialValue
  };

  const onSubmit = async (values, { setSubmitting, setErrors, setStatus }) => {
    delete axios.defaults.headers.common["Authorization"];
    setIsUploading(true);

    let failedUpload = {};
    let uploadedFiles = [];

    customsDocumentTypes.forEach(async documentType => {
      const objParams = customsDocuments[documentType]
      let file
      if (typeof values[documentType] === "string") {
        file = new File(
          [values[documentType]], `${documentType}`,
          {type: "text/plain"}
        )
      } else {
        file = values[documentType]
      }
      const formData = createFormData(
        objParams.cloudinary_params, file
      );
      try {
        const cloudinaryResponse = await axios.post(
          CLOUDINARY_UPLOAD_URL,
          formData
        );
        const data = cloudinaryResponse.data;
        objParams.cloudinary_public_id = data.public_id;
        objParams.cloudinary_url = data.secure_url;
        uploadedFiles.push(data);
        if (uploadedFiles.length === customsDocumentTypes.length) {
          setUploadedFiles(uploadedFiles);
        }
      } catch (error) {
        setIsUploading(false);
        failedUpload = {
          ...failedUpload,
          [documentType]: "Upload failed"
        };
        setErrors({
          customs_document_requests: {
            ...failedUpload
          }
        });
      }
    })
  };

  const personalIdentification = customsDocumentTypes.filter(type => type.includes('personal_identification'))

  return (
    <Layout.Content className="upload-documents">
      <ModalLoading visible={isUploading} text="Uploading..." />
      <Row>
        <Col>
          <div className="upload-documents-title">
            <h2>
              Additional Customs Documentation
            </h2>
            <p>
              To ensure accurate and timely delivery of goods, we will need
              your help to provide us with the documents below for customs
              clearance.
            </p>
          </div>

          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={onSubmit}
          >
            {formikProps => {
              const { values, errors, touched, handleChange, setFieldValue } = formikProps;

              const isFieldError = type => {
                return !!(
                  (touched && touched[type] &&
                    errors && errors[type])
                )
              }
              const getFieldError = type => {
                return (
                  (isFieldError(type) && (
                    <p className="invalid-text">{errors[type]}</p>
                  )) || ''
                )
              }

              const getFileUploadProps = type => ({
                hasError: !!getFieldError(type),
                onChange: file => {
                  setFieldValue(type, file)
                },
                accept: acceptedFormats
              })

              return (
                <Card style={{ marginTop: 24 }}>
                  <Form>
                    <div>
                      <div className="document-item mb-0">
                        <p className="document-item-title mb-1">Tracking Number</p>
                        <h2 className={'tracking-number'}>{trackingNo}</h2>
                      </div>
                      <hr />
                      <p style={{
                        fontWeight: '500',
                        fontSize: 16,
                        color: '#595959',
                        marginBottom: 24
                      }}>All fields are mandatory</p>
                      <div>
                        {
                          !!personalIdentification.length && (
                            <div className="document-item" key="personal_identification_front">
                              <p className="document-item-title" style={{ marginBottom: 16 }}>Identification Card</p>
                              <Row gutter={16} className={'upload-cards-wrapper'}>
                                {personalIdentification.map(type => {
                                  return (
                                    <Col xl={12} lg={12} sm={{span: 24}} xs={{span: 24}} key={type}>
                                      <div className="document-item upload-cards">
                                        <div>
                                          <p className="document-item-title"
                                             style={{textAlign: 'center'}}>{documentTypeLabels[type].label}</p>
                                        </div>
                                        <div className="document-item-file">
                                          <SelectFilePreview {...getFileUploadProps(type)} />
                                          {getFieldError(type)}
                                        </div>
                                      </div>
                                    </Col>
                                  )
                                })}
                              </Row>
                            </div>
                          )
                        }

                        {
                          customsDocumentTypes
                            .filter(type => !type.includes('personal_identification'))
                            .map(type => {
                              return (
                                <div className={`document-item ${type}`} key={type}>
                                  <div className="flex-between">
                                    <p className="document-item-title">{documentTypeLabels[type].label}</p>
                                    {
                                      customsDocuments[type].customs_document_template_url &&
                                      <a href={customsDocuments[type].customs_document_template_url} target="_blank"
                                         rel="noopener noreferrer">
                                        Download {documentTypeLabels[type].label} Template Here
                                      </a>
                                    }
                                  </div>
                                  {documentTypeLabels[type].help &&
                                  <p className="document-item-help">{documentTypeLabels[type].help}</p>}
                                  <div className="document-item-file">
                                    {
                                      type === 'website_link' ?
                                        <Input
                                          size="large" value={values.website_link}
                                          onChange={handleChange} name="website_link"/>
                                        :
                                        <SelectFilePreview {...getFileUploadProps(type)} />
                                    }
                                    {getFieldError(type)}
                                  </div>
                                </div>
                              )
                            })
                        }
                      </div>
                    </div>

                    <div className="document-item">
                      <p className="document-item-title">Security Check</p>
                      <div className="document-item-file">
                        <div className={'recaptcha-wrapper'}>
                          <ReCaptcha
                            sitekey="6Ldk4rwUAAAAAD0HDIbMh80R28vnwdLYwlE_5D6A"
                            onChange={value => {
                              setFieldValue("captcha", value || "");
                              setCaptcha(value);
                            }}
                            // size={"compact"}
                          />
                        </div>
                        {touched.captcha && errors.captcha && (
                          <span className="invalid-text">{errors.captcha}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      {uploadError && (
                        <Alert type="error" message={uploadError}/>
                      )}
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        disabled={isUploading}
                      >
                        {isUploading ? "Submitting..." : "Submit Documentation"}
                      </Button>
                    </div>
                  </Form>
                </Card>
              );
            }}
          </Formik>
        </Col>
      </Row>
    </Layout.Content>
  );
};

export default UploadDocuments;
