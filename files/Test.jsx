import * as React from "react";
import { useEffect } from "react";
import {
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { torch } from "react-native-pytorch-core";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const size = 256;
  const r = size * 0.33;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle cx={size / 2} cy={size - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

function CustomButton() {
  function handleStuff() {
    console.log("typeof torch 123", typeof torch);
    console.log(torch.rand([2, 3]).data());
  }

  return (
    <TouchableOpacity onPress={handleStuff}>
      <Animated.Text>Click here!</Animated.Text>
    </TouchableOpacity>
  );
}

function CustomText() {
  return (
    <View>
      <Text>What a cool text123</Text>
    </View>
  );
}

export default function App() {
  const message = React.useMemo(() => "Hello, world! This is brialliant", []);
  const [text, setText] = React.useState("What is this?");

  useEffect(() => {
    console.log("mount");

    return function () {
      console.log("unmount");
    };
  }, []);

  // throw new Error("foo123456466876");

  return (
    <Animated.View
      style={{ paddingTop: 80, flex: 1, backgroundColor: "orange" }}
    >
      <Animated.Text>{message}</Animated.Text>
      <CustomButton />
      <CustomText />
      <TextInput onChangeText={setText} value={text} />
      <Image
        source={{
          uri: "https://cdn.britannica.com/21/183421-050-5D114B59/Flamingo.jpg",
          width: 300,
          height: 200
        }}
      />
      <HelloWorld />
    </Animated.View>
  );
}
