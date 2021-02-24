import React, { Component } from "react";
import { connect } from "react-redux";
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';
import _ from 'lodash';
import { DatePicker } from "antd";
import moment from "moment";

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class InputField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typed: false,
      anchorEl: null
    };
  }

  handleOnChange = (e) => {
    if (_.has(this.props, 'onChange')) {
      this.props.onChange(e);
      this.setState({
        typed: true
      });
    }
  }

  handleKeyUp = (e) => {
    if (_.has(this.props, 'onKeyUp')) {
      this.props.onKeyUp(e);
      this.setState({
        typed: true
      });
    }
  }

  handlePopoverOpen = (e) => {
    this.setState({
      anchorEl: e.currentTarget
    });
  };

  handlePopoverClose = () => {
    this.setState({
      anchorEl: null
    });
  };

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    const {
      fieldName,
      i18nKey,
      placeholder,
      name,
      type,
      stateValue,
      disableLabel,
      optional,
      allowPickup,
      disabled,
      rows
    } = this.props;

    let error = false;
    if (!optional) {
      error = !stateValue || stateValue.length === 0
    }

    let inputField
    if (type === 'textarea') {
      inputField = (
        <textarea
          name={name}
          type={type}
          className="form-control"
          id={name}
          placeholder={placeholder ? this.props.t(placeholder) : 'please enter ' + fieldName}
          rows={(rows || "3")}
          value={stateValue}
          disabled={disabled || allowPickup === false ? true : false}
          onChange={(e) => this.handleOnChange(e)}
        />
      )
    } 
    else {
      let inputText = (
        <input
          name={name}
          type={type}
          className="form-control"
          id={name}
          placeholder={placeholder ? this.props.t(placeholder) : 'please enter ' + fieldName}
          value={stateValue}
          step="any"
          disabled={disabled || allowPickup === false ? true : false}
          onChange={(e) => this.handleOnChange(e)}
          onKeyUp={(e) => this.handleKeyUp(e)}
        />
      )
      if (this.props.countryCode) {
        const countryCode = this.props.countryCode
        inputField = (
          <div className="input-group">
            <div className="input-group-prepend">
              <div className="input-group-text">
                {countryCode.country_calling_code &&
                <img src={`https://www.countryflags.io/${countryCode.country_code}/flat/16.png`} alt=""/>
                }
                <span style={{marginLeft: 8}}>{countryCode.country_calling_code}</span>
              </div>
            </div>
            {inputText}
          </div>
        )
      } else {
        inputField = inputText
      }
    }

    return (
      <div>
        <div className="form-group">
          {
            !optional ?
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey={i18nKey} />
              {
                !disableLabel ?
                <i onMouseEnter={this.handlePopoverOpen} onMouseLeave={this.handlePopoverClose} className="far fa-sm fa-question-circle ml-2"></i>
                :
                null
              }
              {/*<Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                  paper: classes.paper,
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                onClose={this.handlePopoverClose}
                disableRestoreFocus
              >
                <div></div>
              </Popover>*/}
            </div>
            :
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey={i18nKey} />
              <span className="text-secondary"> <Trans i18nKey="orders.optional" /></span>
              {
                !disableLabel ?
                <i onMouseEnter={this.handlePopoverOpen} onMouseLeave={this.handlePopoverClose} className="far fa-sm fa-question-circle ml-2"></i>
                :
                null
              }
              {/*<Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                  paper: classes.paper,
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                onClose={this.handlePopoverClose}
                disableRestoreFocus
              >
                <div></div>
              </Popover>*/}
            </div>
          }
          {inputField}
        </div>

        {
          error && this.state.typed && !optional ?
          <div className="alert alert-warning" role="alert">
            {placeholder ? this.props.t(placeholder) : 'please enter ' + fieldName}
          </div>
          :
          null
        }
      </div>
    );
  };
}

function mapStateToProps() {
  return ({

  });
}

export default compose(
  connect(mapStateToProps, {}),
  withStyles(styles),
  withNamespaces('common')
)(InputField);
