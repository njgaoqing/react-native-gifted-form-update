/**
 * 根据请求的数据进行匹配
 */
import React from 'react';
import createReactClass from 'create-react-class';
import {
  View, ListView, Text, TouchableHighlight, TextInput, Image, PixelRatio
} from 'react-native';

var WidgetMixin = require('../mixins/WidgetMixin.js');
var OptionWidget = require('./OptionWidget.js');

module.exports = createReactClass({
  mixins: [WidgetMixin],

  getDefaultProps() {
    return {
      type: 'SelectCountryWidget',
      onClose: () => {},
      code: 'alpha2',
      autoFocus: false,
      url: ''
    };
  },

  async componentWillMount(){
    if(global.userList.length == 0){
      let response = await fetch(this.props.url,{
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Authorization': global.user.userData.token
        }
        });
        let json = await response.json();
        global.userList = json.list;
    }
    this.setState({
        dataSource: this.state.dataSource.cloneWithRows(global.userList)
    })
  },

  onSelect(name, value) {
    this._onChange(value, false);
    // this.props.onClose(name, this.props.navigator);
  },


  // @todo image as option

  renderRow(rowData, sectionID, rowID) {
    // react-native image asset requires static filenames
    // icons from http://www.icondrawer.com/

      return (
        <TouchableHighlight
          key={rowData.alpha2}
          onPress={() => this.onSelect(rowData.name, rowData)}
          underlayColor={this.getStyle('underlayColor').pop()}

          style={this.getStyle(['row'])}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            key={rowData.alpha2+'Image'}
            resizeMode={Image.resizeMode.contain}
            source={rowData.gender == 1 ? require('../icons/male.png'): require('../icons/female.png')}
            style={{
              height: 30,
              width: 30,
              marginLeft: 10,
              marginRight: 10,
            }}
          />

            <Text numberOfLines={1} style={{
              flex: 1,
            }}>{rowData.name}</Text>
          </View>
        </TouchableHighlight>
      );
  },

  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([]),
      search: '',
    };
  },

  updateRows(text = '') {
    if (text.length === 0) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([]),
      });
      return;
    }

    var results = [];

    for (let i = 0; i < global.userList.length; i++) {
      if (global.userList[i].name.toLowerCase().indexOf(text.trim().toLowerCase()) !== -1) {
        results.push(global.userList[i]);
        if (results.length === 10) { // max results
          break;
        }
      }
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(results),
    });
  },


  doSearch(text) {
    // console.log(text);
    this.setState({search: text});
    this.updateRows(text);
  },

  renderHeader() {
    return (
      <View
        style={this.getStyle(['textInputContainer'])}
      >
        <TextInput
          autoFocus={this.props.autoFocus}
          style={this.getStyle(['textInput'])}
          placeholder='请输入检索关键字'
          onChangeText={this.doSearch}
          value={this.state.search}
          clearButtonMode="while-editing"
        />
      </View>
    );
  },

  renderSeparator(sectionId, rowId) {
    return (
      <View
        key={`sep:${sectionId}:${rowId}`}
        style={this.getStyle(['separator'])}
      />
    );
  },

  render: function() {
    return (
      <View
        style={this.getStyle(['container'])}
      >
        {this.renderHeader()}
        <ListView
          style={this.getStyle(['listView'])}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          automaticallyAdjustContentInsets={false}
          initialListSize={10}
          pageSize={10}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          renderSeparator={this.renderSeparator}
          enableEmptySections={true}
        />
      </View>

    );
  },

  defaultStyles: {
    container: {
      flex: 1,
    },
    listView: {
      flex: 1,
    },
    textInputContainer: {
      backgroundColor: '#C9C9CE',
      height: 44,
      borderTopColor: '#7e7e7e',
      borderBottomColor: '#b5b5b5',
      borderTopWidth: 1 / PixelRatio.get(),
      borderBottomWidth: 1 / PixelRatio.get(),
    },
    textInput: {
      backgroundColor: '#FFFFFF',
      height: 28,
      borderRadius: 5,
      paddingTop: 4.5,
      paddingBottom: 4.5,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 7.5,
      marginLeft: 8,
      marginRight: 8,
      fontSize: 15,
    },
    row: {
      height: 44,
      // padding: 10,
      justifyContent: 'center',
      backgroundColor: '#fff',
    },
    separator: {
      height: 0.5,
      backgroundColor: '#9ba1ac',
    },
    underlayColor: '#c7c7cc',
  },
});
