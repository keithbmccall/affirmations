/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type Input } from '@rneui/themed';
import { RefObject, useRef } from 'react';
import { Animated, TextInputProps } from 'react-native';

// @ts-ignore
type InputRefPlugType = RefObject<Input> & {
  // @ts-ignore
  current: RefObject<Input>['current'] & {
    input: any;
    shakeAnimationValue: Animated.Value;
    focus(): () => void;
    blur(): () => void;
    clear(): () => void;
    isFocused(): () => boolean;
    setNativeProps: (nativeProps: Partial<TextInputProps>) => void;
    shake: () => void;
    render(): JSX.Element;
  };
};

export const useInputRef: (defaultValue: string) => InputRefPlugType = (
  defaultValue: string,
  // @ts-ignore
) => useRef<Input>(defaultValue) as InputRefPlugType;
