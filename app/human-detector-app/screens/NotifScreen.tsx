import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../src/navigation/stackParamList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
  pads: {
    padding: 10,
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
    borderColor: '#D3D3D3',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotifScreen({ navigation, route }: Props): React.ReactElement<Props> {
  const { notifications } = route.params;
  const sortedNotifications = notifications.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  return (
    <View style={styles.container}>
      <ScrollView>
        {sortedNotifications.map((notification) => (
          <View key={notification.id}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate('Snapshot', { snapshotId: notification.snapshotId });
              }}
            >
              <Text style={styles.menuButtonText}> {notification.timestamp.toString()} </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
