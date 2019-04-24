import { Omit } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import Popover, { PopoverProps as PopoverPropsType } from '@material-ui/core/Popover';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import EventListener from 'react-event-listener';
import DateTextField, { DateTextFieldProps } from '../_shared/DateTextField';

export interface OuterInlineWrapperProps extends Omit<DateTextFieldProps, 'utils' | 'onClick'> {
  /** On open callback */
  onOpen?: () => void;
  /** On close callback */
  onClose?: () => void;
  onSetToday?: () => void;
  showTodayButton?: boolean;
  clearLabel?: React.ReactNode;
  todayLabel?: React.ReactNode;
  /** Dialog props passed to material-ui Dialog */
  PopoverProps?: Partial<PopoverPropsType>;
}

export interface InlineWrapperProps extends OuterInlineWrapperProps {
  handleAccept: () => void;
  isAccepted: boolean;
  /** Show only calendar for datepicker in popover mode */
  onlyCalendar: boolean;
}

export class InlineWrapper extends React.PureComponent<
  InlineWrapperProps & WithStyles<typeof styles>
> {
  public static propTypes: any = {
    onlyCalendar: PropTypes.bool,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    PopoverProps: PropTypes.object,
    labelFunc: PropTypes.func,
    onClear: PropTypes.func,
    isAccepted: PropTypes.bool,
    handleAccept: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    keyboard: PropTypes.bool,
    classes: PropTypes.object.isRequired,
    innerRef: PropTypes.any,
    showTodayButton: PropTypes.bool,
    clearLabel: PropTypes.node.isRequired,
    clearable: PropTypes.bool.isRequired,
    todayLabel: PropTypes.node.isRequired,
    onSetToday: PropTypes.func.isRequired,
  };

  public static defaultProps = {
    value: new Date(),
    onlyCalendar: false,
    isAccepted: false,
    keyboard: undefined,
    showTodayButton: false,
    clearable: false,
    clearLabel: 'Clear',
    todayLabel: 'Today',
  };

  public static getDerivedStateFromProps(nextProps: InlineWrapperProps) {
    // only if accept = true close the popover
    if (nextProps.isAccepted) {
      if (nextProps.onClose) {
        nextProps.onClose();
      }

      return {
        anchorEl: null,
      };
    }

    return null;
  }

  public state = {
    anchorEl: null,
  };

  public open = (e: React.SyntheticEvent) => {
    this.setState({ anchorEl: e.currentTarget });
    if (this.props.onOpen) {
      this.props.onOpen();
    }
  };

  public close = () => {
    this.setState({ anchorEl: null });

    if (this.props.value !== null) {
      this.props.handleAccept();
    }

    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  public handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter': {
        this.props.handleAccept();
        this.close();
        break;
      }
      default:
        // if key is not handled, stop execution
        return;
    }

    // if event was handled prevent other side effects
    event.preventDefault();
  };

  public handleSetTodayDate = () => {
    if (this.props.onSetToday) {
      this.props.onSetToday();
    }
  };

  public handleClear = () => {
    this.close();
    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  public render() {
    const {
      value,
      format,
      children,
      onOpen,
      onClose,
      PopoverProps,
      isAccepted,
      keyboard,
      onlyCalendar,
      classes,
      handleAccept,
      showTodayButton,
      clearable,
      clearLabel,
      todayLabel,
      onSetToday,
      ...other
    } = this.props;

    const isOpen = Boolean(this.state.anchorEl);

    return (
      <React.Fragment>
        {isOpen && <EventListener target="window" onKeyDown={this.handleKeyDown} />}

        <DateTextField
          value={value}
          format={format}
          onClick={this.open}
          keyboard={keyboard}
          {...other}
        />

        <Popover
          id="picker-popover"
          open={isOpen}
          anchorEl={this.state.anchorEl}
          onClose={this.close}
          classes={{
            paper: classes.popoverPaper,
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: keyboard ? 'right' : 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: keyboard ? 'right' : 'center',
          }}
          {...PopoverProps}
        >
          <React.Fragment>
            {children}

            <DialogActions
              classes={{
                root: clearable || showTodayButton ? classes.dialogActions : undefined,
                action: clsx(classes.dialogAction, {
                  [classes.clearableDialogAction]: clearable,
                  [classes.todayDialogAction]: showTodayButton,
                }),
              }}
            >
              {showTodayButton && (
                <Button color="primary" onClick={this.handleSetTodayDate}>
                  {todayLabel}
                </Button>
              )}

              {clearable && (
                <Button color="primary" onClick={this.handleClear}>
                  {clearLabel}
                </Button>
              )}
            </DialogActions>
          </React.Fragment>
        </Popover>
      </React.Fragment>
    );
  }
}

export const styles = {
  popoverPaper: {
    maxWidth: 310,
    minWidth: 290,
  },
  dialogActions: {
    // set justifyContent to default value to fix IE11 layout bug
    // see https://github.com/dmtrKovalenko/material-ui-pickers/pull/267
    justifyContent: 'flex-start',
  },
  dialogAction: {
    // empty but may be needed for override
  },
  clearableDialogAction: {},
  todayDialogAction: {},
};

export default withStyles(styles)(InlineWrapper);
