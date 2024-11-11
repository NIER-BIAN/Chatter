//===========================================================================================
// IMPORTS

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import Start from './components/Start';
import Chat from './components/Chat';

//===========================================================================================
// NAVIGATOR

// create the navigator
// method returns obj with components Navigator and Screen, used to create nav stack
const Stack = createNativeStackNavigator();

/*
  Note that "name" is the handler used to navigate to the particular screen.
  It does NOT have to be the same as component's name.
  When transitioning to screen, it is this name that is passed to 'navigation.navigate'.
  The 'navigation' func, on the other hand, is a prop passed to all components included
  in Stack.Navigator, and contains a set of methods used to navigate to other screens.
*/

//===========================================================================================
// APP

const App = () => {

    //=======================================================================================
    // FIREBASE

    // Firebase configuration
    const firebaseConfig = {
	apiKey: "AIzaSyBfzuYvMb-0EbKyXM41sUvqXJxwMNfYi5c",
	authDomain: "chatter-123b2.firebaseapp.com",
	projectId: "chatter-123b2",
	storageBucket: "chatter-123b2.firebasestorage.app",
	messagingSenderId: "61729897071",
	appId: "1:61729897071:web:2494eca71f274470e3ab9a"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Cloud Firestore and get a reference to the service
    // the reference to the db can then be passed to elsewhere within the app (Chat)
    const db = getFirestore(app);

    //=======================================================================================
    // UI RENDERING
    
    return (
	<NavigationContainer>
	    <Stack.Navigator
		initialRouteName="Start"
	    >
		<Stack.Screen
		    name="Start"
		    component={Start}
		/>
		<Stack.Screen
		    name="Chat"
	        >
	        {/*
	          spread syntax passes all props received by chat to chat component
	          while still passing additional props (db)
	        */}
	        { props => <Chat db={db} {...props} /> }
	        </Stack.Screen>
	    </Stack.Navigator>
	</NavigationContainer>
    );
}

//===========================================================================================
// EXPORT

export default App;
