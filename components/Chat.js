//==========================================================================================
// IMPORTS

import { useState, useEffect } from "react";
import { Alert, StyleSheet, View, Text, TextInput,
	 TouchableOpacity,Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";
// client-side storage lib
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ route, navigation, db, isConnected }) => {

    // note that 'route' and 'navigation' are props passed to all components under Stack.Navigator
    const { userID, username, bgColor } = route.params;
    
    //======================================================================================
    // STATE MANAGEMENT
    
    // GiftedChat comes with its own props 1 of 4: messages
    const [messages, setMessages] = useState([]);

    // GiftedChat comes with its own props 2 of 4: renderBubble
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

    // GiftedChat comes with its own props 3 of 4: onSend
    // write to firestore DB, which triggers the onSnapshot listener which triggers a re-render
    const onSend = (newestMessage) => {
	// issue a query to add newestMessage obj as a document to the collection.
	// addDoc accepts a collection() reference and the object you want to add
	// note that addDoc() will also auto-generate an ID for the new document
	addDoc(collection(db, "messages"), newestMessage[0])
    };
    
    // GiftedChat comes with its own props 4 of 4: user (constructed in render tag)
    
    //======================================================================================
    // SIDE EFFECTS

    useEffect(
	
	() => {
	    // place username on top of screen
	    navigation.setOptions({ title: username });
	},
	[]
    );
    
    const loadCachedChats = async () => {
	const cachedChats = await AsyncStorage.getItem("cached_chats") || [];
	setLists(JSON.parse(cachedChats));
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
	      {/* pass the messages state, onSend prop, and the current user inf to GiftedChat */}
	      <GiftedChat
	        messages={messages}
                renderBubble={renderBubble}
	        onSend={newestMessage => onSend(newestMessage)}
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
