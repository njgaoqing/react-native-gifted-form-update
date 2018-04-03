import React from 'react';
import createReactClass from 'create-react-class';
import {
  View,
  TextInput,
  PixelRatio
} from 'react-native';

var WidgetMixin = require('../mixins/WidgetMixin.js');


module.exports = createReactClass({
  mixins: [WidgetMixin],
  
  getDefaultProps() {
    return {
      type: 'TextAreaWidget',
    };
  },

  _onValueChange(){
    console.log(this.props);
    this.props.onClose(this.props.name, this.state.value, null);
  },
  
  render() {
    return (
      <View style={this.getStyle('textAreaRow')}>
        <TextInput
          style={this.getStyle('textArea')}
          multiline={true}
          {...this.props}
          onFocus={() => this.props.onFocus(true)}
          onChangeText={this._onChange}
          onValueChange={this._onValueChange}
          value={this.state.value}
        />
      </View>
    );
  },
  
  defaultStyles: {
    textAreaRow: {
      backgroundColor: '#fff',
      height: 120,
      borderBottomWidth: 1 / PixelRatio.get(),
      borderColor: '#c8c7cc',
      paddingLeft: 10,
      paddingRight: 10,
    },
    textArea: {
      fontSize: 15,
      flex: 1,
    },
  },
  
});
