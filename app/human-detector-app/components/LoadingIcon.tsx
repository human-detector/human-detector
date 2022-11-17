import * as React from 'react';
import { Animated, Easing, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '../src/styles';

export enum LoadingState {
  Loading,
  Success,
  Failure,
}

export interface LoadingIconProps {
  state: LoadingState;
  background?: boolean;
}

export function LoadingIcon(props: LoadingIconProps): React.ReactElement<LoadingIconProps> {
  const [rotation, setRotation] = React.useState(0);
  const { state } = props;
  const rotationAnim = React.useRef(new Animated.Value(0)).current;
  rotationAnim.addListener(({ value }) => {
    setRotation(value);
  });

  const loop = Animated.loop(
    Animated.timing(rotationAnim, {
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
      toValue: new Animated.Value(360),
    })
  );

  React.useEffect(() => {
    switch (state) {
      case LoadingState.Success:
      case LoadingState.Failure:
        loop.reset();
        break;
      default:
        loop.start();
        break;
    }
  }, [state]);

  const { background } = props;
  const backgroundColor = background ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)';

  return (
    <View style={[styles.centerIcon, { backgroundColor }]}>
      <Animated.View style={[{ transform: [{ rotate: `${rotation}deg` }] }]}>
        {state === LoadingState.Loading && <AntDesign name="loading2" size={100} color="black" />}
        {state === LoadingState.Success && (
          <AntDesign name="checkcircleo" size={100} color="green" />
        )}
        {state === LoadingState.Failure && (
          <AntDesign name="exclamationcircleo" size={100} color="red" />
        )}
      </Animated.View>
    </View>
  );
}

LoadingIcon.defaultProps = {
  background: false,
};
