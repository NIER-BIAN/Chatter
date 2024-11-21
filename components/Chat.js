//==========================================================================================
// IMPORTS

import { useState, useEffect } from "react";
import { Alert, StyleSheet, View, Text, TextInput,
	 TouchableOpacity,Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";
// client-side storage lib
import AsyncStorage from "@react-native-async-storage/async-storage";
// for sending geolocations
import MapView from 'react-native-maps';

// local
import CustomActions from './CustomActions';

const Chat = ({ route, navigation, db, storage, isConnected }) => {

    // note that 'route' and 'navigation' are props passed to all components under Stack.Navigator
    const { userID, username, bgColor } = route.params;
    
    //======================================================================================
    // STATE MANAGEMENT

    // GiftedChat comes with its own props. When it iterates through all msg to render each msg,
    // it provides info about the current msg being processed to the render functions
	
    // GiftedChat comes with its own props 1 of 7: messages
    const [messages, setMessages] = useState([]);
    
    // GiftedChat comes with its own props 2 of 7: onSend
    // write to firestore DB, which triggers the onSnapshot listener which triggers a re-render
    const onSend = (newestMessage) => {
	// issue a query to add newestMessage obj as a document to the collection.
	// addDoc accepts a collection() reference and the object you want to add
	// note that addDoc() will also auto-generate an ID for the new document
	addDoc(collection(db, "messages"), newestMessage[0])
    };

    // GiftedChat comes with its own props 3 of 7: renderBubble
    // set colours for speech-bubbles of sender vs receiver
    const renderBubble = (props) => {
	return (
	    /*
	       spread syntax passes all props received by renderBubble directly to
	       the Bubble component. e.g. text, timestamp, sent or received statuses etc.
	     */
	    <Bubble
	      {...props}
	      wrapperStyle={{
	        right: { backgroundColor: "#000" },
	        left: { backgroundColor: "#FFF"}
	      }}
	    />
  	);
    }
    // GiftedChat comes with its own props 4 of 7: renderInputToolbar
    // prevent user from sending message when offline
    const renderInputToolbar = (props) => {
	if (isConnected) return <InputToolbar {...props} />;
	else return null;
    };
    
    // GiftedChat comes with its own props 5 of 7: renderCustomActions
    // i.e. the circle button that leads to options to send media and location
    const renderActions = (props) => {
	return <CustomActions storage={storage} userID={userID} {...props} />;
    };

    // GiftedChat comes with its own props 6 of 7: renderCustomView
    // it is called internally by GiftedChat for each msg being rendered
    // to determine whether a custom view needs to be displayed based on the msg's content.
    const renderCustomView = (props) => {

	// extract the currentMessage object from the props
	const { currentMessage } = props;

	// if currentMessage contains location data, return a MapView
	if (currentMessage.location) {
	    return (
		    <MapView
		      style={{width: 150,
			height: 100,
			borderRadius: 13,
			margin: 3}}
		      // Note that latitudeDelta & longitudeDelta determine size of the map
		      region={{
		        latitude: currentMessage.location.latitude,
		        longitude: currentMessage.location.longitude,
		        latitudeDelta: 0.0922,
		        longitudeDelta: 0.0421,
		      }}
		    />
	    );
	}
	return null;
    }
    
    // GiftedChat comes with its own props 7 of 7: user (constructed in render tag)
    
    //======================================================================================
    // SIDE EFFECTS

    useEffect(
	
	() => {
	    // place username on top of screen
	    navigation.setOptions({ title: username });
	},
	[]
    );

    // called by second useEffect hook
    const loadCachedChats = async () => {
	const cachedChats = await AsyncStorage.getItem("cached_chats") || [];
	setMessages(JSON.parse(cachedChats));
    }

    // make unsubMessages visible to return / cleanup block
    // otherwise its scope is limited to the if block
    let unsubMessages;
    
    useEffect(
	
	() => {
	    
	    // set up onSnapshot listener
	    // onSnapshot uses a callback that (unlike async/await) can be directly run in useEffect
	    // it will fetch an updated documents list when it detects any changes
	    if (isConnected === true) {
		
		// unregister any pre-existing onSnapshot() listener to avoid
		// registering multiples when useEffect code is re-executed.
		if (unsubMessages) unsubMessages();
		unsubMessages = null;
		
		// onSnapshot arg 1 of 2: q
		// get all messages and sort by descending createdAt
		const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

		// onSnapshot arg 2 of 2: callback called when change detected
		unsubMessages = onSnapshot(q, async (documentsSnapshot) => {
		    
		    // Note: callback also called at the start
		    // i.e. it also loads the intial set of msgs
		    
		    let curMessages = [];
		    
		    documentsSnapshot.forEach(doc => {
			curMessages.push(
			    { id: doc.id,
			      ...doc.data(),
			      // to faciliate desc. sorting
			      createdAt: new Date(
				  doc.data().createdAt.toMillis()
			      )
			    }
			)
		    });

		    // set cache
		    try {
			await AsyncStorage.setItem('cached_chats', JSON.stringify(curMessages));
		    } catch (error) {
			console.log(error.message);
		    }
		    
		    setMessages(curMessages);
		});

	    } else loadCachedChats();
	    
	    // note: onSnapshot() **returns** the listener unsubscribe function
	    
	    // Effect Cleanup: will be called when the Chat component is going to be unmounted
	    return () => {
		// check that unsubShoppinglists isn't undefined
		if (unsubMessages) unsubMessages();
	    }
	},
	
	// Re-establish  listener once reconnected
	[isConnected]
    );

    
    //======================================================================================
    // UI RENDERING

    // NOTE: "item" is a reserved keyword for the renderItem prop in FlatList
    return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
	    
	      {/* GiftedChat comes with its own props */}
	      {/*
	        Note that GiftedChat passes onSend as a prop to the func assigned
	        to renderCustomActions prop (where msgs with images and locations
		are constructed and sent).
	      */}
	      <GiftedChat
	        messages={messages}
	        onSend={newestMessage => onSend(newestMessage)}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
	        renderActions={renderActions}
                renderCustomView={renderCustomView}
	        user={{
	          _id: userID,
                  name: username
	        }}
              />
  	      {/* For older mobiles running android: prevent keyboard from blocking view */}
	      { Platform.OS === 'android'
	        ? <KeyboardAvoidingView behavior="height" />
	        : null
	      }

	    </View>
	    
    )
}

//===========================================================================================
// STYLES

const styles = StyleSheet.create({
    container: {
	flex: 1
    }
});

//===========================================================================================
// EXPORT

export default Chat;
