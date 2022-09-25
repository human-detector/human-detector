import {useState} from "react";
import Camera from "../classes/Camera";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CameraSettingsButton from "../components/CameraSettingsButton";
import Group from "../classes/Group";

export default function GroupMenu( { navigation }: Props ) {
    var groupOne:Group = new Group("AAAAAA's Group", "99");
    var groupTwo:Group = new Group("BBBBB's Group", "725");
    var groupThree:Group = new Group("CCCCC's Group", "400");

    const[listOfCameras, setListOfCameras] = useState([groupOne, groupTwo, groupThree])

    const pressHandler = () => {
        navigation.navigate('Cameras')
        console.log(typeof navigation);
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                { listOfCameras.map((item) => {
                    return (
                        <View key={item.groupId}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress ={pressHandler}
                            >
                                <Text style={styles.menuButtonText}> {item.groupName} </Text>
                                <CameraSettingsButton cameraId={item.groupId}></CameraSettingsButton>
                            </TouchableOpacity>
                        </View>
                    )
                })}

                <View key={'add-button'}>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.addButtonItem]}
                        onPress = {() => {
                            const cameraList: Camera[] = [...listOfCameras];
                            //adding camera here test
                            cameraList.push(new Camera("test", "test", "test"));
                            setListOfCameras(cameraList);
                        }}
                    >
                        <Text style={styles.addButtonText}> + </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>

        /*
         * Instead of doing FlatList, I might want to change this to a scrollable view
         */
        //   <SafeAreaView style={styles.container}>
        //     <FlatList
        //         data={listOfCameras}
        //         renderItem={renderItem}
        //     />
        //   </SafeAreaView>
        //
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //paddingTop: 40,
        //paddingHorizontal: 20
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#777',
        padding: 8,
    },
    pads: {
        padding: 10
    },
    boldHeader: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    menuItem: {
        marginTop: 24,
        marginLeft: 20,
        marginRight: 20,
        padding: 30,
        backgroundColor: '#E0FFFF',
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#D3D3D3'
    },
    addButtonItem: {
        borderColor: '#D3D3D3',
        backgroundColor: '#DCDCDC',
    },
    menuButtonText: {
        fontSize: 24,
        marginTop: 10,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        alignItems: 'center',
        fontSize: 50,
        marginTop: 0,
        marginBottom: 0,
    },
});

export function GroupOnPress(){
    return (
        <View>
            <Text> Placeholder </Text>
        </View>
    )
}

export function GroupDisplayButton(){
    return (
        <View>
            <Text> Placeholder </Text>
        </View>
    )
}