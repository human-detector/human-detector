import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View, Image, ImageURISource, Dimensions } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { LoadingIcon, LoadingState } from '../components/LoadingIcon';
import { BackendContext } from '../contexts/backendContext';
import { RootStackParamList } from '../src/navigation/stackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'Snapshot'>;

export default function SnapshotScreen({ route }: Props): React.ReactElement<Props> {
  const { snapshotId } = route.params;
  const backendService = React.useContext(BackendContext);
  const [snapshotUrl, setSnapshotUrl] = React.useState<ImageURISource | null>(null);

  React.useEffect(() => {
    backendService!
      .getSnapshotSource(snapshotId)
      .then(setSnapshotUrl)
      .catch((error) => console.error(`Failed to fetch snapshot URL`, error));
  }, []);

  if (!snapshotUrl) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <LoadingIcon state={LoadingState.Loading} />;
  }

  return (
    <View>
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={Dimensions.get('window').width}
        imageHeight={Dimensions.get('window').height}
      >
        <Image
          style={{ width: '100%', height: '100%' }}
          source={snapshotUrl}
          resizeMode="contain"
        />
      </ImageZoom>
    </View>
  );
}
