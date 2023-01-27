import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { styles } from '../src/styles';
import { UserContext } from '../contexts/userContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotifScreen({ navigation, route }: Props): React.ReactElement<Props> {
  const userContext = React.useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext not found!');
  }

  const { cams } = route.params;
  const notifications = userContext.getNotifsFromCams(cams);

  // Date object to be used to compare if the current day is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sortedNotifications = notifications.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

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
                {notification.timestamp.getTime() - today.getTime() > 0
                  ? 'Today'
                  : notification.timestamp.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </Text>
              <View style={styles.notificationBottomText}>
                <Text style={styles.notificationTimeText}>
                  {notification.timestamp.toLocaleTimeString(undefined, {
                    hour12: true,
                  })}
                </Text>
                <Text style={styles.cameraNameText} numberOfLines={1}>
                  {userContext.cameraMap.get(notification.cameraId)?.cameraName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
