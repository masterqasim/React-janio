import React from "react";
import { Row, Col, Card, Layout, Button } from "antd"
import Loader from "../components/animation/Loader"

const UploadSuccess = () => {
  return (
    <Layout.Content className="success-documents">
      <Row>
        <Col>
          <Card>
            <Row type="flex" justify="center">
              <Col>
                <div className={'success-loader-container'}>
                  <Loader width={173} height={173}/>
                </div>
              </Col>
            </Row>
            <Row type="flex" justify="center" className="mt-2">
              <Col><h4 className="text-center success-message">Uploaded Successfully</h4></Col>
            </Row>
            <Row type="flex" justify="center" className="mt-2">
              <Col>
                <p className="text-center description">Thank you for uploading your documents. If you wish to update your documents,
                  please contact us at <a href="mailto:support@janio.asia" class="mailtolink">support@janio.asia</a></p>
              </Col>
            </Row>
            <Row type="flex" justify="center" className="mt-3" style={{marginBottom: "100px"}}>
              <Col span={12} className="text-center">
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{background: "#050593"}}
                  onClick={() => {
                    window.location.reload()
                  }}>
                  Done
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Layout.Content>
  )
};

export default UploadSuccess;
