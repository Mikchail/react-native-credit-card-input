import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  ViewPropTypes,
  Animated,
  Button
} from "react-native";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    // marginLeft: 20,

  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
  button: {
    position: "absolute", width: undefined, right: 0, bottom:0
  }
});

const CVC_INPUT_WIDTH = 70;
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const widthScreen = Dimensions.get("window").width;
const CARD_NUMBER_INPUT_WIDTH = widthScreen - EXPIRY_INPUT_WIDTH - CARD_NUMBER_INPUT_WIDTH_OFFSET;
const ITEM_LENGTH = widthScreen;

const data = [
  {name:"number" },
  {name: "name"},
  {name: "expiry"},
  {name:"cvc" },
];
/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
  };
  scrollX = new Animated.Value(0);
  flatRef = React.createRef();
  currentIndex = React.createRef();
  inputRefs = {};
  
  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
    },
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  constructor(props){
    super(props);
    this.currentIndex.current = 0;
  }

  componentDidMount = () => this._focus(this.props.focused);

  UNSAFE_componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    if (!field) return;
    // console.log(field);
    // const scrollResponder = this.refs.Form.getScrollResponder();
    // const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    // NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
    //   e => { throw e; },
    //   x => {
    //     scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
    //     this.refs[field].focus();
    //   });
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;
    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  handleOnNext = () => {
    if (this.currentIndex.current === data.length - 1) {
      return;
    }
    if (this.flatRef.current) {
      this.flatRef.current.scrollToIndex({
        animated: true,
        index: this.currentIndex.current + 1,
      });
      this.currentIndex.current = this.currentIndex.current + 1
      const field = data[this.currentIndex.current].name;
      if(this.inputRefs[field]){
        setTimeout(() => {
          this.inputRefs[field]?.focus?.();
        }, 400)
      }
    }
  };

  onMomentumScrollEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    let newIndex = Math.round(x / widthScreen);
    if (newIndex > data.length) {
      this.currentIndex.current = data.length - 1;
      return
    }
    if (newIndex < 0) {
      this.currentIndex.current = 0;
      return
    }
    this.currentIndex.current = newIndex;
    const field = data[newIndex].name;
    if(this.inputRefs[field]){
      this.inputRefs[field]?.focus?.();
    }
  }

  nextButton = (props) => {
    const ButtonTS = this.props.Button
    if(ButtonTS) {
      return <ButtonTS {...props} />
    }
    return <Button {...props}/>
  }

  lastButton = (props) => {
    const ButtonTS = this.props.Button
    if(ButtonTS) {
      return <ButtonTS {...props} />
    }
    return <Button {...props}/>
  }

  handlePress = () => {
    if(this.props.onPress){
      this.props.onPress();
    }
  }

  render() {
    const {
      cardImageFront, cardImageBack, inputContainerStyle,
      wrapperStyle,buttonStyle,
      values: { number, expiry, cvc, name, type }, focused,
      allowScroll, requiresName, requiresCVC, requiresPostalCode,
      cardScale, cardFontFamily, cardBrandIcons,
      status
    } = this.props;
   
    return (
      <View style={s.container}>
        <CreditCard focused={focused}
          brand={type}
          scale={cardScale}
          fontFamily={cardFontFamily}
          imageFront={cardImageFront}
          imageBack={cardImageBack}
          customIcons={cardBrandIcons}
          name={requiresName ? name : " "}
          number={number}
          expiry={expiry}
          cvc={cvc} />
           <Animated.FlatList
              keyboardShouldPersistTaps={"always"}
              ref={this.flatRef}
              data={data}
              horizontal={true}
              onMomentumScrollEnd={this.onMomentumScrollEnd}
              scrollEventThrottle={16}
              scrollEnabled={allowScroll}
              snapToInterval={ITEM_LENGTH}
              decelerationRate={"fast"}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              bounces={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: this.scrollX } } }],
                { useNativeDriver : true },
              )}
              renderItem={({item , index}) => {

                const inputRange = [
                  (index - 1) * ITEM_LENGTH,
                  index * ITEM_LENGTH,
                  (index + 1) * ITEM_LENGTH,
                ];

                const opacity = this.scrollX.interpolate({
                  inputRange,
                  outputRange: [0, 1, 0],
                  extrapolate: "clamp", 
                });
                const translateX = Animated.subtract(this.scrollX, index * ITEM_LENGTH).interpolate({
                  inputRange: [0,1],
                  outputRange: [0, -2],
                  extrapolate: "clamp",
                });  
              return (
                <Animated.View style={[{
                  width: ITEM_LENGTH,
                  opacity,
                  transform: [{translateX}]
                }]}>
                  <View style={[{flexDirection: "row", alignItems: "center"}, wrapperStyle]}>
                    <CCInput {...this._inputProps(item.name)} 
                    ref={(ref) => this.inputRefs[item.name] = ref}
                      containerStyle={[s.inputContainer, inputContainerStyle]} />
                     {data.length - 1 !== index &&  <this.nextButton
                         activeOpacity={0.7}
                        onPress={this.handleOnNext} title={this.props.textNextButton || "Next"} 
                        disabled={status[item.name] !== "valid"}
                        style={[buttonStyle]} 
                      />}
                      {data.length - 1 === index && this.props.children}
                  </View>
                </Animated.View>
              )
            }}
           /> 
      </View>
    );
  }
}
