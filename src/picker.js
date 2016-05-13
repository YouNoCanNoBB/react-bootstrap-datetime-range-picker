const React = require('react');
const Util = require('./utils');

const TimePicker = require('./timepicker');

const INFINITE = Symbol('∞');

const MONTH = {
    0: "一月",
    1: "二月",
    2: "三月",
    3: "四月",
    4: "五月",
    5: "六月",
    6: "七月",
    7: "八月",
    8: "九月",
    9: "十月",
    10: "十一月",
    11: "十二月"
};

const DateBlock = React.createClass({
    getDefaultProps() {
        return {
            date: new Date(),
            disabled: false,
            month: new Date().getMonth(),
            selecting: false,
            onClick: () => undefined,
            isBeginTime: false,
            isEndTime: false,
        };
    },

    render() {
        const showDate = this.props.date.getDate();
        const showDateMonth = this.props.date.getMonth();

        let className = this.props.disabled ? "disabled" : showDateMonth !== this.props.month ? "not-this-month-date" : "";
        className += (this.props.isSelected ? " selecting" : "");
        className += (this.props.isBeginTime ? " is-begin-time" : "");
        className += (this.props.isEndTime ? " is-end-time" : "");
        className += (Util.dateFormat(this.props.date) === Util.dateFormat(new Date()) ? " today" : "");

        let otherProps = this.props.disabled ? {} : {
            onClick: () => this.props.onClick(this.props.date)
        }

        if (this.props.selecting) {
            otherProps.onMouseEnter = event => this.props.onMouseEnter(this.props.date);
        }

        return (
            <td className={className.trim()} {...otherProps}>
                {showDate}
            </td>
        );
    }
});

const Calendar = props => {
    let dateArray = [new Array(7), new Array(7), new Array(7), new Array(7), new Array(7)];
    const firstDate = new Date(props.inYear + '-' + (props.inMonth + 1));
    const firstDateDay = firstDate.getDay();
    let lastDate;

    dateArray = dateArray.map((week, i) => {
        if (i === 0) {
            week[firstDateDay] = firstDate;

            if (week[0] === undefined) {
                for (let f = firstDateDay - 1, x = -1; f >= 0; f--, x--) {
                    week[f] = Util.getDate(firstDate, x);
                }
            }

            for (let f = firstDateDay + 1, x = 1; f < 7; f++, x++) {
                week[f] = Util.getDate(firstDate, x);
            }
        } else {
            week = Array.from(week).map((x, i) => Util.getDate(lastDate, i + 1));
        }

        lastDate = week[6];
        return week;
    });

    const mapDateBlock = (date, i) => {
        const blockTime = date.getTime();

        const isBeginTimeBlock = Util.dateFormat(blockTime) === Util.dateFormat(props.beginTime);
        const isEndTimeBlock   = Util.dateFormat(blockTime) === Util.dateFormat(props.endTime);

        let isSelected = false;

        if (!isBeginTimeBlock && !isEndTimeBlock) {
            isSelected = (blockTime > props.beginTime.getTime() && blockTime < props.endTime.getTime());
        }

        return (
            <DateBlock
                key={i}
                date={date}
                month={props.inMonth}
                isSelected={isSelected}
                selecting={props.selecting}
                isBeginTime={isBeginTimeBlock}
                isEndTime={isEndTimeBlock}
                onClick={props.onClickDate}
                onMouseEnter={props.onMouseEnter}
            />
        );
    }

    const mapWeek = (week, i) => (
        <tr key={i}>{week.map(mapDateBlock)}</tr>
    );

    const nextMonthBtnProps = props.inYear === props.maxYear && (props.inMonth === props.maxMonth)
        ? { className: "disabled" }
        : { onClick: props.handleClickNextMonth }

    const previousMonthBtnProps = props.inYear === props.minYear && (props.inMonth === props.minMonth)
        ? { className: "disabled" }
        : { onClick: props.handleClickPreviousMonth }

    return (
        <center>
            <table className='table table-condensed calendar'>
                <thead>
                    <tr>
                        <th {...previousMonthBtnProps}>
                            <i className="fa fa-chevron-left switch-month" />
                        </th>
                        <th colSpan="5">{MONTH[props.inMonth] + '　' + props.inYear}</th>
                        <th {...nextMonthBtnProps}>
                            <i className="fa fa-chevron-right switch-month" />
                        </th>
                    </tr>
                    <tr>
                        <th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th>
                    </tr>
                </thead>
                <tbody>
                    { dateArray.map(mapWeek) }
                </tbody>
            </table>
        </center>
    );
};

const PickerBody = React.createClass({
    getDefaultProps() {
        return {
            show: false,
            beginTime: INFINITE,
            endTime: INFINITE
        };
    },

    getInitialState() {
        let { beginTime, endTime } = this.props;

        const beginTimeFullYear = beginTime.getFullYear();
        const beginTimeMonth = beginTime.getMonth();

        let initialState = { noEndTime: false };

        if (endTime === INFINITE) {
            endTime = new Date(beginTime.getTime() + 1000);
            initialState.noEndTime = true;
        }

        const endTimeFullYear = endTime.getFullYear();
        const endTimeMonth = endTime.getMonth();

        return {
            ...initialState,
            beginTime,
            endTime,
            selecting: false,
            calendar1: {
                inYear: beginTimeFullYear,
                inMonth: beginTimeMonth,
                maxYear: beginTimeFullYear,
                maxMonth: beginTimeMonth
            },
            calendar2: {
                inYear: endTimeFullYear + (beginTimeMonth === endTimeMonth && beginTimeFullYear === endTimeFullYear && beginTimeMonth === 11 ? 1 : 0),
                inMonth: beginTimeFullYear === endTimeFullYear ? (beginTimeMonth === 11 ? 0 : endTimeMonth + 1) : endTimeMonth,
                minYear: beginTimeFullYear + (beginTimeMonth === 11 ? 1 : 0),
                minMonth: beginTimeMonth === 11 ? 0 : beginTimeMonth + 1
            }
        };
    },

    render() {
        const thisProps = this.props;

        const noOutline = {outline: 'none'};
        const style = {
            display: thisProps.show ? 'block' : 'none',
            width: 560,
            padding: 10,
            ...thisProps.leftSide ? {} : {right: 0, left: 'auto'}
        };

        const renderEndTime = this.state.noEndTime ? new Date('2099-12-31 23:59:59') : this.state.endTime;

        return (
            <div className="dropdown-menu datetime-range-picker" style={style}>
                <div className="row">
                    <div className="col-xs-6">
                        <Calendar
                            index="first"
                            beginTime={this.state.beginTime}
                            endTime={renderEndTime}
                            onClickDate={date => this.handleClickDate('first', date)}
                            selecting={this.state.selecting}
                            onMouseEnter={this.handleMouseEnterDate}
                            handleClickPreviousMonth={() => this.handleClickPreviousMonth('first')}
                            handleClickNextMonth={() => this.handleClickNextMonth('first')}
                            {...this.state.calendar1}
                        />
                        <TimePicker index='clock1' beginTime={this.state.beginTime} onChange={this.handleChangeTime} />
                    </div>
                    <div className="col-xs-6">
                        <Calendar
                            index="second"
                            beginTime={this.state.beginTime}
                            endTime={renderEndTime}
                            onClickDate={date => this.handleClickDate('second', date)}
                            selecting={this.state.selecting}
                            onMouseEnter={this.handleMouseEnterDate}
                            handleClickPreviousMonth={() => this.handleClickPreviousMonth('second')}
                            handleClickNextMonth={() => this.handleClickNextMonth('second')}
                            {...this.state.calendar2}
                        />
                        <TimePicker
                            index='clock2'
                            endTime={renderEndTime}
                            onChange={this.handleChangeTime}
                        />
                    </div>
                </div>
                <hr/>
                <div className="row">
                    <div className="col-xs-12">
                        <button
                            style={noOutline}
                            className={"btn btn-default btn-sm" + (this.state.noEndTime ? ' active' : '')}
                            onClick={this.handleToggleEndTimeLimit}
                        >
                            无截止日期
                        </button>
                        <span className="pull-right">
                            <button style={noOutline} className="btn btn-default btn-sm" onClick={this.props.onCancel}>取消</button>
                            {' '}
                            <button style={noOutline} className="btn btn-success btn-sm" onClick={this.props.onConfirm}>应用</button>
                        </span>
                    </div>
                </div>
            </div>
        );
    },

    handleClickDate(index, date) {
        const originState = this.state;
        const activeCalender = index === 'first' ? 'calendar1' : 'calendar2';

        let newState = {};

        const newDate = Util.dateFormat(date, 'yyyy-MM-dd');
        const newBeginTime = new Date(newDate + Util.dateFormat(originState.beginTime, ' hh:mm:ss'));
        const newEndTime = new Date(newDate + Util.dateFormat(originState.endTime, ' hh:mm:ss'));

        if (!originState.selecting) {
            newState = {
                ...newState,
                selecting: true,
                beginTime: newBeginTime,
                endTime: newEndTime
            };
        }

        if (originState.selecting) {
            if (date.getTime() < new Date(Util.dateFormat(originState.beginTime, 'yyyy-MM-dd 00:00:00')).getTime()) {
                newState = {
                    ...newState,
                    beginTime: newBeginTime,
                    endTime: newEndTime
                };
            } else {
                newState = {
                    ...newState,
                    beginTime: this.state.beginTime,
                    selecting: false,
                    endTime: newEndTime
                };

                if (newState.beginTime.getTime() === newState.endTime.getTime()) {
                    newState = {
                        ...newState,
                        endTime: new Date(newState.endTime.getTime() + 1000)
                    };
                }
            }
        }

        if (date.getMonth() < originState[activeCalender].inMonth) {
            this.handleClickPreviousMonth(index);
        } else if (date.getMonth() > originState[activeCalender].inMonth) {
            this.handleClickNextMonth(index);
        }

        newState.noEndTime = false;

        this.setState(newState, () => {
            this.props.updateValue(this.state.beginTime, this.state.endTime);
        });
    },

    handleMouseEnterDate(date) {
        if (date.getTime() > this.state.beginTime.getTime()) {
            return this.setState({
                endTime: new Date(Util.dateFormat(date, 'yyyy-MM-dd') + Util.dateFormat(this.state.endTime, ' hh:mm:ss')),
                noEndTime: false
            }, () => {
                this.props.updateValue(this.state.beginTime, this.state.endTime);
            });
        }

        return this.setState({
            endTime: this.state.beginTime,
            noEndTime: false
        }, () => {
            this.props.updateValue(this.state.beginTime, this.state.endTime);
        });
    },

    handleClickPreviousMonth(index) {
        const activeCalender = index === 'first' ? 'calendar1' : 'calendar2'
        const { inMonth, inYear } = this.state[activeCalender];

        let newState = {
            [activeCalender]: {
                ...this.state[activeCalender],
                inMonth: inMonth === 0 ? 11 : inMonth - 1,
                inYear: inYear - (inMonth === 0 ? 1 : 0)
            }
        };

        if (activeCalender === 'calendar1') {
            newState.calendar2 = {
                ...this.state.calendar2,
                minMonth: newState.calendar1.inMonth === 11 ? 0 : newState.calendar1.inMonth + 1,
                minYear: newState.calendar1.inYear + (newState.calendar1.inMonth === 11 ? 1 : 0)
            };
        } else {
            newState.calendar1 = {
                ...this.state.calendar1,
                maxMonth: newState.calendar2.inMonth === 0 ? 11 : newState.calendar2.inMonth - 1,
                maxYear: newState.calendar2.inYear - (newState.calendar2.inMonth === 0 ? 1 : 0)
            };
        }

        if (
            new Date(newState.calendar1.inYear + '-' + newState.calendar1.inMonth).getTime() >
            new Date(newState.calendar1.maxYear + '-' + newState.calendar1.maxMonth).getTime()
            ||
            new Date(newState.calendar2.inYear + '-' + newState.calendar2.inMonth).getTime() <
            new Date(newState.calendar2.minYear + '-' + newState.calendar2.minMonth).getTime()
        ) {
            return;
        }

        return this.setState(newState);
    },

    handleClickNextMonth(index) {
        const activeCalender = index === 'first' ? 'calendar1' : 'calendar2'
        const { inMonth, inYear } = this.state[activeCalender];

        let newState = {
            [activeCalender]: {
                ...this.state[activeCalender],
                inMonth: inMonth === 11 ? 0 : inMonth + 1,
                inYear: inMonth === 11 ? inYear + 1 : inYear
            }
        }

        if (activeCalender === 'calendar1') {
            newState.calendar2 = {
                ...this.state.calendar2,
                minMonth: newState.calendar1.inMonth === 11 ? 0 : newState.calendar1.inMonth + 1,
                minYear: newState.calendar1.inYear + (newState.calendar1.inMonth === 11 ? 1 : 0)
            }
        } else {
            newState.calendar1 = {
                ...this.state.calendar1,
                maxMonth: newState.calendar2.inMonth === 0 ? 11 : newState.calendar2.inMonth - 1,
                maxYear: newState.calendar2.inYear - (newState.calendar2.inMonth === 0 ? 1 : 0)
            }
        }

        if (
            new Date(newState.calendar1.inYear + '-' + newState.calendar1.inMonth).getTime() >
            new Date(newState.calendar1.maxYear + '-' + newState.calendar1.maxMonth).getTime()
            ||
            new Date(newState.calendar2.inYear + '-' + newState.calendar2.inMonth).getTime() <
            new Date(newState.calendar2.minYear + '-' + newState.calendar2.minMonth).getTime()
        ) {
            return;
        }

        this.setState(newState);
    },

    handleChangeTime(index, timeStr) {
        let newState = {};

        if (index === 'clock1') {
            newState = {
                beginTime: new Date(Util.dateFormat(this.state.beginTime, 'yyyy-MM-dd') + ' ' + timeStr),
                endTime: this.state.endTime
            };
        } else {
            newState = {
                beginTime: this.state.beginTime,
                endTime: new Date(Util.dateFormat(this.state.endTime, 'yyyy-MM-dd') + ' ' + timeStr),
                noEndTime: false
            }
        }

        if (newState.beginTime.getTime() > newState.endTime.getTime()) {
            newState.endTime = new Date(newState.beginTime.getTime() + 1000);
        }

        this.setState(newState, () => {
            this.props.updateValue(this.state.beginTime, this.state.endTime);
        });
    },

    handleToggleEndTimeLimit() {
        this.setState({
            noEndTime: !this.state.noEndTime
        }, () => {
            this.props.updateValue(this.state.beginTime, this.state.noEndTime ? INFINITE : this.state.endTime);
        });
    }
});

const PickerTrigger = React.createClass({
    getDefaultProps() {
        const now = new Date();

        const beginTime = Util.getDate(now, 0);
        const endTime = Util.getDate(now, 7);

        return {
            elementType: 'input',
            beginTime,
            endTime,
            onChange: () => undefined,
            className: ''
        };
    },

    getInitialState() {
        let { beginTime, endTime } = this.props;

        endTime = endTime === 'Infinite' ? INFINITE : endTime;

        return {
            ...this.validator(beginTime, endTime),
            showPicker: false,
            leftSide: true
        };
    },

    componentWillReceiveProps(nextProps) {
        if ( this.props.beginTime.getTime() !== nextProps.beginTime.getTime() ) {
            this.setState({
                ...this.validator(nextProps.beginTime, nextProps.endTime)
            });
        }

        if (this.props.endTime !== nextProps.endTime ) {
            if (this.props.endTime === 'Infinite' || nextProps.endTime === 'Infinite') {
                this.setState({
                    ...this.validator(nextProps.beginTime, nextProps.endTime)
                });
            } else if (this.props.endTime.getTime() !== nextProps.endTime.getTime()) {
                this.setState({
                    ...this.validator(nextProps.beginTime, nextProps.endTime)
                });
            }
        }
    },

    render() {
        const { beginTime, endTime } = this.state;

        const timeString =
            Util.dateFormat(this.state.beginTime, 'yyyy-MM-dd hh:mm:ss')
            + ' ~ '
            + (endTime === INFINITE ? '∞' : Util.dateFormat(endTime, 'yyyy-MM-dd hh:mm:ss'));

        let elementProps = { ...this.props };
        delete elementProps.beginTime;
        delete elementProps.endTime;
        delete elementProps.onChange;
        delete elementProps.elementType;
        delete elementProps.type;

        const wrapStyle = {
            position:'relative',
            display: 'inline-block'
        };

        if ('style' in elementProps) {
            if ('display' in elementProps.style) {
                wrapStyle.display = elementProps.style.display;
                delete elementProps.style.display;
            }
            if ('position' in elementProps.style) {
                wrapStyle.position = elementProps.style.position;
                delete elementProps.style.position;
            }
        }

        const props = {
            show: this.state.showPicker,
            beginTime,
            endTime,
            updateValue: this.handleUpdateValue,
            onCancel: this.handleClickCancel,
            onConfirm: this.handleClickConfirm,
            leftSide: this.state.leftSide
        };

        if (this.props.elementType === 'input') {
            return (
                <div style={wrapStyle}>
                    <input
                        {...elementProps}
                        ref='trigger'
                        onClick={this.handleClickTrigger}
                        type="text"
                        value={timeString}
                        className={this.props.className || 'form-control'}
                        onChange={e => undefined}
                    />
                    { this.state.showPicker ? (<PickerBody {...props} />) : null }
                </div>
            );
        }

        return (
            <div style={{position:'relative', display: 'inline-block'}}>
                <button
                    {...elementProps}
                    ref='trigger'
                    onClick={this.handleClickTrigger}
                    className={this.props.className || 'btn btn-default'}
                >
                    {timeString}
                </button>
                { this.state.showPicker ? (<PickerBody {...props} />) : null }
            </div>
        );
    },

    validator(b, e) {
        let beginTime = b;
        let endTime = e;

        if (beginTime instanceof Date && String(beginTime) !== 'Invalid Date') {
            if (endTime instanceof Date && String(endTime) !== 'Invalid Date') {
                if (beginTime.getTime() < endTime.getTime()) {
                    return {
                        beginTime, endTime
                    }
                }
            } else if (endTime === INFINITE || endTime === 'Infinite') {
                return {
                    beginTime,
                    endTime: INFINITE
                }
            }
        }

        return {
            beginTime: new Date(),
            endTime: new Date(Util.getDate(new Date(), 7, 'yyyy-MM-dd hh:mm:ss'))
        }
    },

    handleClickTrigger() {
        const { left, width } = this.refs.trigger.getBoundingClientRect();

        const a = document.body.clientWidth - left - 570;
        const b = left + width - 570;

        this.setState({
            showPicker: true,
            leftSide: b < a
        });
    },

    handleUpdateValue(beginTime, endTime) {
        this.setState({
            beginTime,
            endTime
        });
    },

    handleClickCancel() {
        this.setState(this.getInitialState())
    },

    handleClickConfirm() {
        this.setState({
            showPicker: false
        }, () => {
            this.props.onChange(this.state.beginTime, this.state.endTime === INFINITE ? 'Infinite' : this.state.endTime);
        });
    }
});

module.exports = PickerTrigger;