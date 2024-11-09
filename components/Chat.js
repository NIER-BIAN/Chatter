import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

// note that 'route', like 'navigation', is a prop passed to all components under Stack.Navigator
const Chat = ({ route, navigation }) => {
    
    const { username, bgColor } = route.params;
    
    useEffect(

	// arg 1: code you want to run as a side effect
	() => {
	    navigation.setOptions({ title: username });
	},

	// arg 2: dependency array
	[]

    );
    
    return (
	    // array destructuring: combine 2 style obj into 1
	    <View style={[styles.container, { backgroundColor: bgColor }]}>
	      <Text>Hello!</Text>
	    </View>
    );
}

const styles = StyleSheet.create({
    container: {
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center'
    }
});

export default Chat;
