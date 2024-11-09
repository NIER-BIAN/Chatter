import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native';
import Svg from 'react-native-svg';
import SvgIcon from './SvgIcon';

const Start = ({ navigation }) => {
    
    const [username, setUsername] = useState('');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    
    const bgColorOptions = ['#090C08', '#474056', '#8A95A5', '#B9C6AE', '#FFFFFF'];
    
    return (
	    <ImageBackground
	       source={require('../assets/bg_image.png')}
	       style={styles.bgImage}
	    >
	      <View style={styles.container}>
	    
                <Text style={styles.appTitle}>Chatter</Text>

	        <View style={styles.secondaryContainer}>

	          <View style={styles.inputWrapper}>
                    <SvgIcon size={20} stroke={2} />
	            <TextInput
                      style={styles.textInput}
                      value={username}
                      onChangeText={setUsername}
                      placeholder='Type your username here'
	            />
	          </View>
	    
	          <View style={styles.bgColorChooseWrapper}>
	            <Text style={styles.bgColorChooseText}>Choose Background Colour:</Text>
	            <View style={styles.bgColorOptionsContainer}>
	              {bgColorOptions.map((color, index) => (
                        <TouchableOpacity
                          key={index}
		          // array destructuring: combine 2 style obj into 1
                          style={[
			      styles.bgColorOptionsButton,
			      { backgroundColor: color,
				borderWidth: 3,
				borderColor: index === 4
				? '#D3D3D3'
				: 'transparent'}
		  	  ]}
                          onPress={() => setBgColor(color)}
	                />
	              ))}
                    </View>
	          </View>
	    
                  <TouchableOpacity
		    style={styles.startChattingButton}
	            onPress={
	              // Chat screen will access the user’s name via route.params.name
	  	      // 'route', like 'navigation', is a prop passed to all screens
		      // listed under Stack.Navigator
	              () => navigation.navigate(
			  'Chat',
			  { username: username, bgColor: bgColor }
		      )
	            }
	          >
	            <Text style={styles.startChattingButtonText}>Start chatting</Text>
	          </TouchableOpacity>
	        </View>
	      </View>
	    </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: {
	flex: 1
    },
    container: {
	flex: 1,
	justifyContent: 'space-evenly',
	alignItems: 'center',
    },
    appTitle: {
        fontSize: 45,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    secondaryContainer: {
	width: '88%',
	height: '35%',
	backgroundColor: '#FFFFFF',
	justifyContent: 'space-evenly',
	alignItems: 'center',
	borderRadius: 20,
    },
    inputWrapper: {
	flexDirection: 'row',
	alignItems: 'center', // Vertically align items
	width: "88%",
	padding: 15,
	borderWidth: 1,
        opacity: 0.5,
	borderRadius: 20,
    },
    textInput: {
	fontSize: 16,
	fontWeight: '300',
	color: '#757083',
	marginLeft: 10,
    },
    bgColorChooseWrapper: {
	textAlign: 'left',
        width: '88%',
    },
    bgColorChooseText: {
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        opacity: 1,
	marginBottom: 10,
    },
    bgColorOptionsContainer: {
        flexDirection: 'row',
    },
    bgColorOptionsButton: {
	marginRight: 15,
	width: 40,
	height: 40,
	borderRadius: 20
    },
    startChattingButton: {
	width: '88%',
	backgroundColor: '#757083',
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
	borderRadius: 20,
    },
    startChattingButtonText: {
	fontSize: 16,
	fontWeight: '600',
	color: '#FFFFFF',
    },
});

export default Start;
