import React, { Component } from "react";
import { connect } from "react-redux";
import compose from 'recompose/compose';
import Select from 'react-select';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class DropdownField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
      anchorEl: null
    };
  }

  handleOnChange = (e) => {
    this.props.onChange(e);
    this.setState({
      selected: true
    })
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
      // fieldName,
      placeholder,
      clearValue,
      i18nKey,
      labelClassName,
      dropdownClassName,
      disableLabel,
      isMulti,
      allowPickup,
      renderItems,
      loading,
      value
    } = this.props;

    return (
      <div className="w-100">
        {
          !disableLabel ?
            <div className={`h5 ${labelClassName} font-weight-bold capitalize`}>
              <Trans i18nKey={i18nKey} />
              <i onMouseEnter={this.handlePopoverOpen} onMouseLeave={this.handlePopoverClose} className="far fa-sm fa-question-circle ml-2"></i>
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
            null
        }
        {
          !clearValue ?
            <Select
              isLoading={loading}
              className={dropdownClassName}
              placeholder={placeholder}
              isMulti={isMulti}
              value={value}
              isDisabled={allowPickup === false ? true : false}
              onChange={(e) => this.handleOnChange(e)}
              options={renderItems}
            />
            :
            <Select
              className={dropdownClassName}
              placeholder={placeholder}
              isMulti={isMulti}
              value={null}
              isDisabled={allowPickup === false ? true : false}
              onChange={(e) => this.handleOnChange(e)}
              options={renderItems}
            />
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
)(DropdownField);
