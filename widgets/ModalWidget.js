import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableHighlight,
  Navigator,
  Image,
  TouchableOpacity,
  PixelRatio,
} from 'react-native';

var WidgetMixin = require('../mixins/WidgetMixin');

var GiftedFormManager = require('../GiftedFormManager');
var TimerMixin = require('react-timer-mixin');

var moment = require('moment');

module.exports = createReactClass({
  mixins: [TimerMixin, WidgetMixin],

  getDefaultProps() {
    return {
      type: 'ModalWidget',
      bSelect: false,
      scrollEnabled: true,
      disclosure: true,
      cancelable: false,
      displayValue: '',
      onClose: () => {}
    };
  },

  propTypes: {
    type: PropTypes.string,
    scrollEnabled: PropTypes.bool,
    disclosure: PropTypes.bool,
    cancelable: PropTypes.bool,
    displayValue: PropTypes.string,
    onClose: PropTypes.func
  },

  getInitialState() {
    return {
      // @todo
      // should be an object with all status
      // childrenAreValid: {},
    };
  },

  renderDisclosure() {
    if (this.props.disclosure === true) {
      return (
        <Image
          style={this.getStyle('disclosure')}
          resizeMode={Image.resizeMode.contain}
          source={require('../icons/disclosure.png')}
        />
      );
    }
    return null;
  },

  componentWillReceiveProps(nextProps) {
    var formState = GiftedFormManager.stores[this.props.formName];
    if (typeof formState !== 'undefined') {
      if (typeof formState.values[this.props.name] !== 'undefined') {
        this.setState({
          value: formState.values[this.props.name],
        });
        this._validate(formState.values[this.props.name]);
      }
    }
  },

  onPress() {
    var _self = this;

    var {
      GiftedFormModal
    } = require('../GiftedForm.js');


    var route = {
      onClose: _self.onClose,
      renderScene(navigation) {
        // not passing onFocus/onBlur of the current scene to the new scene
        var {onFocus, onBlur, ...others} = _self.props;
        return (
          <GiftedFormModal
            {...others}
            navigation={navigation}
            isModal={true}
            children={_self._childrenWithProps}
          />
        );
      },
      getTitle() {
        return _self.props.title || '';
      },
      refreshData(){
        var val = '';
        if(!_self.props.bSelect){
          val = _self._getDisplayableValue();
          _self.onClose(_self.props.displayValue, val);
        }else{
          val = _self.state.value;
        }
        
        return {name: _self.props.displayValue, value: val};
      },
      configureScene() {
        var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
        // disable pop gesture
        sceneConfig.gestures = {};
        return sceneConfig;
      },
      renderLeftButton(navigator) {
        if (_self.props.cancelable === true) {
          return (
            <TouchableOpacity
              onPress={() => {
                _self.requestAnimationFrame(() => {
                  _self.onClose(null, navigator);
                });
              }}
            >
              <Image
                style={{
                  width: 21,
                  marginLeft: 10,
                  tintColor: '#097881',
                }}
                resizeMode={Image.resizeMode.contain}
                source={require('../icons/close.png')}
              />
            </TouchableOpacity>
          );
        }
        return null;
      },
      renderRightButton(navigator) {
        // @todo other solution than onBack ? maybe do something automatically when scene get focus
        // @todo move button style to themes
        return (
          <TouchableOpacity
            onPress={() => {
              _self.requestAnimationFrame(() => {
                _self.onClose(null, navigator);
              });
            }}
          >
            <Image
              style={{
                width: 21,
                marginRight: 10,
                tintColor: '#097881',
              }}
              resizeMode={Image.resizeMode.contain}
              source={require('../icons/check.png')}
            />
          </TouchableOpacity>
        );
      },
    };

    if (this.props.openModal === null) {
      console.warn('GiftedForm: openModal prop is missing in GiftedForm component');
    } else {
      this.props.openModal(route);
    }
  },

  componentWillMount() {
    this._childrenWithProps = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        formStyles: this.props.formStyles,
        openModal: this.props.openModal,
        formName: this.props.formName,
        navigator: this.props.navigator,
        navigation: this.props.navigation,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        onValidation: this.props.onValidation,
        onValueChange: this.props.onValueChange,
        onClose: this.onClose,
      });
    });
  },

  componentDidMount() {
    this.setState({
      value: this._getDisplayableValue(),
    });
  },

  onClose(name, value, navigation) {
    if (typeof value === 'string') {
      this.setState({
        value: value,
      });
    } else{
      if(name == 'salesmanName'){
        this.setState({
          value: value.name,
        });
      }else{
        this.setState({
          value: value.title,
        });
      }

      if(navigation != undefined &&　navigation){
        navigation.state.params.callback({name: this.props.displayValue, value: value});
        navigation.goBack();
      }
    }
    this.props.onClose && this.props.onClose();
  },

  refreshDisplayableValue() {
    this.setState({
      value: this._getDisplayableValue(),
    });
  },

  _getDisplayableValue() {
    if (this.props.displayValue !== '') {
      if (typeof GiftedFormManager.stores[this.props.formName] !== 'undefined') {
        if (typeof GiftedFormManager.stores[this.props.formName].values !== 'undefined') {
          if (typeof GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] !== 'undefined') {
            if (typeof this.props.transformValue === 'function') {
              return this.props.transformValue(GiftedFormManager.stores[this.props.formName].values[this.props.displayValue]);
            } else if (GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] instanceof Date) {
              return moment(GiftedFormManager.stores[this.props.formName].values[this.props.displayValue]).calendar(null, {
                sameDay: '[Today]',
                nextDay: '[Tomorrow]',
                nextWeek: 'dddd',
                lastDay: '[Yesterday]',
                lastWeek: '[Last] dddd'
              });
            }
            if (typeof GiftedFormManager.stores[this.props.formName].values[this.props.displayValue] === 'string') {
              return GiftedFormManager.stores[this.props.formName].values[this.props.displayValue].trim();
            }
          } else {
            // @todo merge with when not select menu

            // when values[this.props.displayValue] is not found
            // probably because it's a select menu
            // options of select menus are stored using the syntax name{value}, name{value}
            var values = GiftedFormManager.getValues(this.props.formName);
            if (typeof values === 'object') {
              if (typeof values[this.props.displayValue] !== 'undefined') {
                if (typeof this.props.transformValue === 'function') {
                  return this.props.transformValue(values[this.props.displayValue]);
                } else {
                  if (Array.isArray(values[this.props.displayValue])) {
                    // @todo
                    // should return the title and not the value in case of select menu
                    return values[this.props.displayValue].join(', ');
                  } else if (values[this.props.displayValue] instanceof Date) {
                    return moment(values[this.props.displayValue]).calendar(null, {
                      sameDay: '[Today]',
                      nextDay: '[Tomorrow]',
                      nextWeek: 'dddd',
                      lastDay: '[Yesterday]',
                      lastWeek: '[Last] dddd'
                    });
                  } else {
                    return values[this.props.displayValue];
                  }
                }
              }
            }
          }
        }
      }
    }
    return '';
  },

  render() {
    return (
      <TouchableHighlight
        onPress={() => {
          // this.requestAnimationFrame(() => {
          //  this.onPress();
          // });
          this.onPress();
        }}
        underlayColor={this.getStyle('underlayColor').pop()}

        {...this.props} // mainly for underlayColor

        style={this.getStyle('rowContainer')}
      >
        <View style={this.getStyle('row')}>
          {this._renderImage()}
          <Text numberOfLines={1} style={this.getStyle('modalTitle')}>{this.props.title}</Text>
          <View style={this.getStyle('alignRight')}>
            <Text numberOfLines={1} style={this.getStyle('modalValue')}>{this.state.value}</Text>
          </View>
          {this.renderDisclosure()}
        </View>
      </TouchableHighlight>
    );
  },

  defaultStyles: {
    rowImage: {
      height: 20,
      width: 20,
      marginLeft: 10,
    },
    rowContainer: {
      backgroundColor: '#FFF',
      borderBottomWidth: 1 / PixelRatio.get(),
      borderColor: '#c8c7cc',
    },
    underlayColor: '#c7c7cc',
    row: {
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
    },
    disclosure: {
      // transform: [{rotate: '90deg'}],
      marginLeft: 10,
      marginRight: 10,
      width: 11,
    },
    modalTitle: {
      width: 110,
      fontSize: 15,
      color: '#000',
      paddingLeft: 10,
    },
    alignRight: {
      alignItems: 'flex-end',
      flex: 1
      // width: 110,
    },
    modalValue: {
      fontSize: 15,
      color: '#c7c7cc',
    },
  },
});
