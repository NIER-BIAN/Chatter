import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// import the screens
import Start from './components/Start';
import Chat from './components/Chat';

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

const App = () => {
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
		    component={Chat}
		/>
	    </Stack.Navigator>
	</NavigationContainer>
    );
}

export default App;
