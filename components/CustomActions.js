//using Cloud Storage for Firebase (1GB of storage for free)

//=========================================================================================
// IMPORTS

import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
// for sending media
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
// for sending geolocations
import * as Location from 'expo-location';

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend }) => {

    //======================================================================================
    // STATE MANAGEMENT
    
    const actionSheet = useActionSheet();
    /*
      NOTE ON useActionSheet:
      
      useActionSheet() works by traversing the component tree upwards until it finds a
      **context provider** that makes the ActionSheet available.
      This higher-level component uses a context provider (like React.createContext)
      to make the ActionSheet accessible to all its descendants. In this case, it is
      GiftedChat, but in it can also be a parent component of GiftedChat.

      The crucial point is the presence of an ActionSheet component
      somewhere within the component tree above CustomActions.js!
    */
    
    const [image, setImage] = useState(null); // URI of img from library OR camera
    
    //======================================================================================
    // ACTION SHEET SET-UP

    // display an action menu ("action sheet") that contains a set of defined actions
    const onActionPress = () => {
	
	const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
	const cancelButtonIndex = options.length - 1;

	// actioinSheet is reference obj initialised with useActionSheet() above
	actionSheet.showActionSheetWithOptions(

	    /*
	      actionSheet.showActionSheetWithOptions arg 1 of 2: config obj for action sheet
	      note the js obj shorthand:
	      { options: options, cancelButtonIndex: cancelButtonIndex }
	      i.e. it's looking for keys named options and cancelButtonIndex
	    */
	    {
		options,
		cancelButtonIndex, // for identifying cancel btn within action sheet
	    },

	    // actionSheet.showActionSheetWithOptions arg 2 of 2: callback func
	    async (buttonIndex) => {
		switch (buttonIndex) {
		case 0:
		    pickImage();
		    return;
		case 1:
		    takePhoto();
		    return;
		case 2:
		    getLocation();
		    // Note there's no `return;` here
		    // i.e. execution will continue to the default case.
		default:
		}
	    },
	);
    };

    // 'Choose From Library'
    const pickImage = async () => {

	// displays prompt to user asking for permission to access media lib
	let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

	// note the optional chaining in `permissions?.granted`
	// used to to prevent errors from access properties on null or undefined
	if (permissions?.granted) {
	    
	    // open device’s media lib
	    let result = await ImagePicker.launchImageLibraryAsync(
		{ mediaTypes: ImagePicker.MediaTypeOptions.Images }
	    );
	    // mediaTypes: ImagePicker.MediaTypeOptions.Images is default anyway
	    // had you left it as ImagePicker.launchImageLibraryAsync();

	    // result.canceled is true if user cancels the process / doesn’t pick a file
	    // result.assets is an array referencing all of the picked media files
	    if (!result.canceled) setImage(result.assets[0]);
	    // note that by default the assets array only has 1 asset
	    // as by default the user isn’t allowed to pick multiple assets
	    
	    else setImage(null)
	}
    }

    // 'Take Picture'
    const takePhoto = async () => {
	
	// display prompt to user asking for permission to access camera
	let permissions = await ImagePicker.requestCameraPermissionsAsync();
	
	if (permissions?.granted) {
	    
	    let result = await ImagePicker.launchCameraAsync();
	    
	    if (!result.canceled) {

		// asks for permission to read and write to media library
		let mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
		// save newly taken pic to media library
		if (mediaLibraryPermissions?.granted) await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
		// display image
		setImage(result.assets[0]);
		
	    } else setImage(null)
	}
    }

    // 'Send Location'
    const getLocation = async () => {

	// request permission to access the device’s location 
	let permissions = await Location.requestForegroundPermissionsAsync();

	if (permissions?.granted) {
	    
	    const location = await Location.getCurrentPositionAsync({})

	    if (location) {
		/*
	           Note that GiftedChat passes onSend as a prop to the func assigned
	           to renderCustomActions prop (where msgs with images and locations
		   are constructed and sent).
		*/
		onSend(
		    // in place of some text, location obj is passed to onSend as arg (newMessage
		    {
			location: {
			    longitude: location.coords.longitude,
			    latitude: location.coords.latitude,
			},
		    }
		);
	    } else Alert.alert("Error occurred while fetching location");
	    
	} else Alert.alert("Permissions to read location aren't granted");
    }

    //======================================================================================
    // UI RENDERING
    
    return (
	
	    <TouchableOpacity style={styles.container} onPress={onActionPress}>
	      <View style={[styles.wrapper, wrapperStyle]}>
	      {/*
	         Note that wrapperStyle and iconTextStyle are props that Gifted Chat
	         makes available to whatever rederXXX function you pass to
	       */}
	        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
	      </View>
	    </TouchableOpacity>
    );
}

//=========================================================================================
// STYLES

const styles = StyleSheet.create({
    container: {
	width: 26,
	height: 26,
	marginLeft: 10,
	marginBottom: 10,
    },
    wrapper: {
	borderRadius: 13,
	borderColor: '#b2b2b2',
	borderWidth: 2,
	flex: 1,
    },
    iconText: {
	color: '#b2b2b2',
	fontWeight: 'bold',
	fontSize: 16,
	backgroundColor: 'transparent',
	textAlign: 'center',
    },
});

//=========================================================================================
// EXPORT

export default CustomActions;
