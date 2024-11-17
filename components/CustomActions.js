//=========================================================================================
// IMPORTS

import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
// for sending media
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// for sending geolocations
import * as Location from 'expo-location';

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {

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

    //------------------------------------------------------------------------------------------
    // 'Choose From Library'

    // called by uploadAndSendImage
    const generateReference = (uri) => {
	const timeStamp = ( new Date() ).getTime();
	// we only want the last string after the last "/". i.e.  "myimage.jpg" or some such
	const imageName = uri.split("/")[uri.split("/").length - 1];
	return `${userID}-${timeStamp}-${imageName}`;
    }

    // called by both pickImage and takePhoto
    const uploadAndSendImage = async (imageURI) => {
	
	// uploadBytes() arg 1 of 2: newUploadRef
	// to upload a file, a new reference for it is needed on the Storage Cloud
	// i.e. create an address for the location of the uploaded file
	// storage is the Firebase Storage handler passed from Chat and App
	const uniqueRefString = generateReference(imageURI);
	const newUploadRef = ref(storage, uniqueRefString);
	
	// uploadBytes() arg 2 of 2: blob
	const response = await fetch(imageURI);
	// convert to blob prior to saving to firebase
	const blob = await response.blob();
        blob.type = 'image/jpeg';
	
	uploadBytes(newUploadRef, blob).then(async (snapshot) => {
	    
	    // prep for rendering image in chat
	    const imageURL = await getDownloadURL(snapshot.ref)
	    
	    // in place of some text, image is passed to onSend as arg newMessage
	    onSend({ image: imageURL })

	});
    }
    
    const pickImage = async () => {

	// displays prompt to user asking for permission to access media lib
	let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
	console.log('Media Library Permission Status: ', permissions);
	
	// note the optional chaining in `permissions?.granted`
	// used to to prevent errors from access properties on null or undefined
	if (permissions?.granted) {
	    
	    // open device’s media lib
	    let result = await ImagePicker.launchImageLibraryAsync();

	    // result.canceled is true if user cancels the process / doesn’t pick a file
	    // result.assets is an array referencing all of the picked media files
	    // note that by default the assets array only has 1 asset
	    // as by default the user isn’t allowed to pick multiple assets
	    if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
	    
	    else Alert.alert("Permissions haven't been granted.");
	}
    }

    //------------------------------------------------------------------------------------------
    // 'Take Picture'
    const takePhoto = async () => {
	
	// display prompt to user asking for permission to access camera
	let permissions = await ImagePicker.requestCameraPermissionsAsync();
	console.log('Camera Permission Status: ', permissions);
	
	if (permissions?.granted) {
	    
	    let result = await ImagePicker.launchCameraAsync();
	    
	    if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);

	    else Alert.alert("Permissions haven't been granted.");
	}
    }

    //------------------------------------------------------------------------------------------
    // 'Send Location'
    const getLocation = async () => {

	// request permission to access the device’s location 
	let permissions = await Location.requestForegroundPermissionsAsync();
	console.log('Location Permission Status: ', permissions);
	
	if (permissions?.granted) {
	    
	    const location = await Location.getCurrentPositionAsync({})

	    if (location) {
		/*
	           Note that GiftedChat passes onSend as a prop to the func assigned
	           to renderActions prop (where msgs with images and locations
		   are constructed and sent).
		*/
		onSend(
		    // in place of some text, location obj is passed to onSend as arg newMessage
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
	
	    <TouchableOpacity
              accessible={true}
              accessibilityLabel="More options"
              accessibilityHint="Choose to send an image, take a photo, or send your location."
              accessibilityRole="button"
	      style={styles.container}
	      onPress={onActionPress}
	    >
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
