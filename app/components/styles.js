let React = require('react-native');

let {
  StyleSheet,
  Dimensions
} = React;

let {width, height} = Dimensions.get('window')

module.exports = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  textLeft: {
    textAlign: 'left'
  },
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  justifyCenter: {
    justifyContent: 'center'
  },
  alignCenter: {
    alignItems: 'center'
  },
  header: {
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row'
  },
  headerBtnLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 27,
    marginLeft: -10,
    marginRight: 10
  },
  headerBtnLeftText: {
    fontSize: 26 
  },
  headerBtnRight: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 27,
    marginLeft: 10,
    marginRight: -10
  },
  headerBtnRightText: {
    fontSize: 26 
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  h4: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  title: {
    fontFamily: 'RobotoCondensed',
    fontWeight: 'bold',
    color: '#1e88e5',
    fontSize: 15
  },
  main: {},
  wrapper: {
    padding: 15,
    paddingHorizontal: 20
  },
  blueBox: {
    backgroundColor: '#1e88e5',
    borderRadius: 4,
    overflow: 'hidden'
  },
  headBlueBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,.06)',
    padding: 10,
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  textHeadBlueBox: {
    fontFamily: 'RobotoCondensed',
    color: '#fff',
    fontSize: 15
  },
  bodyBlueBox: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  col6: {
    width: '50%'
  },
  bigIcon: {
    fontSize: 35
  },
  fontReg: {
    fontFamily: 'RobotoCondensed'
  },
  fontBold: {
    fontFamily: 'RobotoCondensed',
    fontWeight: 'bold'
  },
  textPrimary: {
    color: '#1e88e5'
  },
  textInfo: {
    color: '#00acc1'
  },
  textWarning: {
    color: '#fdd835'
  },
  textDanger: {
    color: '#e53935'
  },
  textSuccess: {
    color: '#43a047'
  },
  textWhite: {
    color: '#fff'
  },
  textBlack: {
    color: '#333'
  },
  textGrey: {
    color: '#757575'
  },
  textMuted: {
    color: '#6c757d'
  },
  bgPrimary: {
    backgroundColor: '#1e88e5'
  },
  bgInfo: {
    backgroundColor: '#00acc1'
  },
  bgWarning: {
    backgroundColor: '#fdd835'
  },
  bgDanger: {
    backgroundColor: '#e53935'
  },
  bgSuccess: {
    backgroundColor: '#43a047'
  },
  bgGrey: {
    backgroundColor: '#eee'
  },
  bgLight: {
    backgroundColor: '#fff'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    opacity: .5
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 3,
  },
  btnPrimary: {
    backgroundColor: '#1e88e5'
  },
  btnInfo: {
    backgroundColor: '#00acc1'
  },
  btnWarning: {
    backgroundColor: '#fdd835'
  },
  btnDanger: {
    backgroundColor: '#e53935'
  },
  btnSuccess: {
    backgroundColor: '#43a047'
  },
  btnGrey: {
    backgroundColor: '#eee'
  },
  btnLg: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  formGroup: {
    marginBottom: 8
  },
  formControl: {
    height: 45,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    paddingHorizontal: 10
  },
  formGrey: {
    backgroundColor: '#eee',
    borderColor: '#eee'
  },
  formWarning: {
    backgroundColor: '#fdd835',
    borderColor: '#fdd835'
  }

});