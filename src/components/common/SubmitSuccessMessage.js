import React, { Component } from "react";
import { connect } from "react-redux";
import { LinkContainer } from 'react-router-bootstrap';
import { Jumbotron } from 'react-bootstrap';
import _ from 'lodash';

class SubmitSuccessMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  renderTitle = () => {
    return <div className="h2 text-center">{this.props.title}</div>;
  }

  renderSubTitles = () => {
    let result = null;

    if (this.props.subTitleList) {
      result = _.map(this.props.subTitleList, (item, i) => {
        return <div key={i} className={i === 0 ? 'h5 text-center mt-3' : 'h5 text-center mt-1'}>
          {item}
        </div>;
      });
    }

    return result;
  }

  renderSecondaryButtons = () => {
    let result = null;

    if (this.props.secondaryButtonsList) {
      result = _.map(this.props.secondaryButtonsList, (item, i) => {
        return <LinkContainer key={i} to={item.link}>
            <div className={i === 0 ? 'w-100 btn btn-secondary btn-lg mt-4' : 'w-100 btn btn-secondary btn-lg mt-1'} role="alert">{item.text}</div>
        </LinkContainer>
      });
    }

    return result;
  }

  renderMainButton = () => {
    let result = null;

    if (this.props.mainButtonList) {
      result = _.map(this.props.mainButtonList, (item, i) => {
        return <LinkContainer key={i} to={item.link}>
            <div className={i === 0 ? 'w-100 btn btn-success btn-lg mt-4' : 'w-100 btn btn-success btn-lg mt-1'} role="alert">{item.text}</div>
        </LinkContainer>
      });
    }

    return result;
  }

  render() {
    return (
      <div className="mt-4 container max-width-40">
        <Jumbotron className="p-4 border border-secondary">
            { this.renderTitle() }
            { this.renderSubTitles() }
            { this.renderSecondaryButtons() }
            { this.renderMainButton() }
        </Jumbotron>
      </div>
    );
  };
}

function mapStateToProps() {
  return ({

  });
}

export default connect(mapStateToProps, {})(SubmitSuccessMessage);
