import { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { Bubble, GiftedChat } from "react-native-gifted-chat";

// note that 'route', like 'navigation', is a prop passed to all components under Stack.Navigator
const Chat = ({ route, navigation }) => {
    
    const { username, bgColor } = route.params;
    
    // GiftedChat comes with its own props 1 of 3: messages
    const [messages, setMessages] = useState([]);

    // GiftedChat comes with its own props 2 of 3: renderBubble
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
    
    // GiftedChat comes with its own props 3 of 3: onSend
    // updates the messages state by appending the new message to existing messages
    const onSend = (newMessage) => {
	setMessages(
	    /*
	      NOTE: This setter doesn't directly assign a new value to messages, but uses
	      a function that takes the previous state (previousMessages) as input.
	      i.e. the setter is able to accept a callback where the first parame is
	      a variable that refers to the latest value of the state.
	      NOTE: GiftedChat.append() creates a new array w.o. modifying the original.
	      This new array is then assigned to the messages state.
	      React then re-renders the chat UI with the updated message list.
	    */
	    previousMessages => GiftedChat.append(previousMessages, newMessage)
	)
    }
    
    useEffect(

	// arg 1: code you want to run as a side effect
	() => {
	    navigation.setOptions({ title: username });

	    // temp: set messages state with a static message UI is visible right away. 
	    setMessages([
		{
		    _id: 1,
		    text: "Hello developer",
		    createdAt: new Date(),
		    user: {
			_id: 2,
			name: "React Native",
			avatar: "https://placeimg.com/140/140/any",
		    },
		},
		{
		    _id: 2,
		    text: 'This is a system message',
		    createdAt: new Date(),
		    system: true,
		},
	    ]);
	    
	},

	// arg 2: dependency array
	[]

    );
    
    return (
	//  array destructuring: combine 2 style obj into 1
	<View style={[styles.container, { backgroundColor: bgColor }]}>
	  {/* GiftedChat comes with its own props */}
	  {/* pass the messages state, onSend prop, and the current user inf to GiftedChat */}
	  <GiftedChat
	    messages={messages}
            renderBubble={renderBubble}
	    onSend={messages => onSend(messages)}
	    user={{
	      _id: 1
	    }}
          />
	  {/* For older mobiles running android: prevent keyboard from blocking view */}
	  { Platform.OS === 'android'
	    ? <KeyboardAvoidingView behavior="height" />
	    : null
	  }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
	flex: 1
    }
});

export default Chat;
