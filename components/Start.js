//======================================================================================
// IMPORT

import { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity,
	 Platform, KeyboardAvoidingView } from 'react-native';
import { getAuth, signInAnonymously } from "firebase/auth";
import Svg from 'react-native-svg';
import SvgIcon from './SvgIcon';

const Start = ({ navigation }) => {

    //==================================================================================
    // ANON AUTHENTICATION
    
    const auth = getAuth(); // returns the authentication handle of Firebase.

    const signInUser = () => {

	
	              // Chat screen will access the user’s name via route.params.name
	  	      // 'route', like 'navigation', is a prop passed to all screens
		      // listed under Stack.Navigator
	
	signInAnonymously(auth) // remember: auth is the auth handler
	    .then(result => {
		/*
		  navigates to the Chat screen while passing user info
		  assigned to their respective route parameters
		  e.g. Chat will access the user’s username via route.params.username
	  	  'route', like 'navigation', is a prop passed to all screens listed
		  in Stack.Navigator
		*/
		navigation.navigate("Chat",
				    { userID: result.user.uid,
				      username: username,
				      bgColor: bgColor
				    });
		Alert.alert("Signed in Successfully!");
	    })
	    .catch((error) => {
		Alert.alert("Unable to sign in, try again later.");
	    })
    }
    
    //==================================================================================
    // STATE MANAGEMENT

    const [username, setUsername] = useState('');
    const [bgColor, setBgColor] = useState('#FFFFFF');

    //==================================================================================
    // UI RENDERING
    
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
	            onPress={signInUser}
	          >
	            <Text style={styles.startChattingButtonText}>Start chatting</Text>
	          </TouchableOpacity>
	        </View>
	      </View>

	      { Platform.OS === "android"
	        ? <KeyboardAvoidingView behavior="height" />
	        : null
	      }
	      { Platform.OS === "ios"
	        ? <KeyboardAvoidingView behavior="padding" />
	        : null
	      }

	    </ImageBackground>
    );
}

//======================================================================================
// STYLES

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
	marginBottom: 300,
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

//======================================================================================
// EXPORT

export default Start;
