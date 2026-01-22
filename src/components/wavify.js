import React, { useEffect } from "react";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Wave({
  width = 400,
  height = 200,
  color = "#4f46e5",
}) {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const y1 = 40 + 20 * Math.sin(phase.value);
    const y2 = 40 - 20 * Math.sin(phase.value);

    return {
      d: `
        M0 ${y1}
        Q ${width / 4} ${y2}, ${width / 2} ${y1}
        T ${width} ${y1}
        V ${height}
        H 0
        Z
      `,
    };
  });

  return (
    <Svg width={width} height={height}>
      <AnimatedPath animatedProps={animatedProps} fill={color} />
    </Svg>
  );
}
