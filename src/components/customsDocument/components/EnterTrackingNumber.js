import React, { useContext } from "react";
import axios from 'axios'
import { Formik, Form as FormikForm } from "formik";
import { Form, Input, Button, Card, Layout, Alert } from "antd";
import * as yup from "yup";
import { CustomsDocumentContext } from "../CustomsDocument.context";
import queryString from "query-string"
import { getNormalizeData } from "../utils";


const LOGO_URL = "https://res.cloudinary.com/janio/image/upload/v1571205547/janio_big_logo.d3cf9b77.svg"

const EnterTrackingNumber = props => {
  const context = useContext(CustomsDocumentContext)
  const qs = queryString.parse(window.location.search)
  
  const validationSchema = () => {
    return yup.object().shape({
      tracking_no: yup.string().required("Please enter your tracking number"),
    });
  };
  const initialValues = () => ({
    tracking_no: qs.tracking_no || '',
  });

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    const fetchDocumentRequests = async tracking_no => {
      const response = await axios.get("/api/attachments/customs-document-requests/", {
        params: { tracking_no }
      })
      const results = response.data.results
      if (!!results.length) {
        context.setCustomsDocuments(getNormalizeData(results[0]))
        context.setTrackingNo(tracking_no)
        context.setPage('uploadDocuments')
      } else {
        setStatus({ error: 'Document request not found'})
      }
      setSubmitting(false)
    }
  
    setSubmitting(true)
    fetchDocumentRequests(values.tracking_no)
  };

  return (
    <Layout.Content className="enter-tracking-no">
      <Card className={'card-container'}>
        <div className={'logo-container'}>
          <img className={'logo-image'} src={LOGO_URL} alt="" />
          <h2 className={'logo-title'}>
            Additional Documentation Upload
          </h2>
        </div>
        <Formik
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          initialValues={initialValues()}
        >
          {formikProps => {
            const {
              values,
              handleChange,
              touched,
              errors,
              status,
              isSubmitting
            } = formikProps;

            const getErrorsProps = fieldName => {
              if (touched[fieldName] && errors[fieldName]) {
                return {
                  validateStatus: "error",
                  help: errors[fieldName],
                  hasFeedback: true
                };
              }
              return {};
            };
            const getFieldProps = fieldName => ({
              name: fieldName,
              size: "large",
              autoComplete: "off",
              value: values[fieldName],
              onChange: handleChange,
              disabled: isSubmitting
            });

            return (
              <FormikForm>
                <Form.Item className={'tracking-number'} label="Tracking Number" {...getErrorsProps("tracking_no")}>
                  <Input {...getFieldProps("tracking_no")} />
                </Form.Item>

                {!isSubmitting && status && status.error && <Alert message={status.error} type="error" />}

                <Form.Item style={{ marginTop: 32 }}>
                  <Button htmlType="submit" type="primary" size="large" block 
                    // style={{ background : "#050593" }}
                    disabled={isSubmitting}>
                    {isSubmitting ? 'Sending request...' : 'Next'}
                  </Button>
                </Form.Item>
                <p className="need-help">Need help? Contact us at <a href="mailto:support@janio.asia">support@janio.asia</a></p>
              </FormikForm>
            );
          }}
        </Formik>
      </Card>
    </Layout.Content>
  );
};

export default EnterTrackingNumber;
