import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { styles } from '../src/styles';

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
