import React, { Component } from "react";
import { LinkContainer } from 'react-router-bootstrap';

class ListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <LinkContainer to={this.props.link}>
        <div className="card pointer mt-1">
          <div className="card-body text-center h5 p-3 mt-0">
            {this.props.text}
          </div>
        </div>
      </LinkContainer>
    );
  }
};

export default ListContainer;
