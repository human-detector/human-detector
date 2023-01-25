import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { styles } from '../src/styles';
import { UserContext } from '../contexts/userContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotifScreen({ navigation, route }: Props): React.ReactElement<Props> {
  const { notifications } = route.params;
  const sortedNotifications = notifications.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const userContext = React.useContext(UserContext);

  if (!userContext) {
    throw new Error('UserContext not found!');
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {sortedNotifications.map((notification) => (
          <View key={notification.id}>
            <TouchableOpacity
              style={styles.notificationMenuItem}
              onPress={() => {
                navigation.navigate('Snapshot', { snapshotId: notification.snapshotId });
              }}
            >
              <Text style={styles.dateText}>
                {notification.timestamp.toLocaleDateString(undefined)}
              </Text>
              <View style={styles.notificationBottomText}>
                <Text style={styles.notificationTimeText}>
                  {notification.timestamp.toLocaleTimeString(undefined, { hour12: true })}
                </Text>
                <Text style={styles.cameraNameText} numberOfLines={1}>
                  {
                    userContext
                      .getGroupFromId(notification.groupId)
                      ?.getCameraFromId(notification.cameraId)?.cameraName
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
