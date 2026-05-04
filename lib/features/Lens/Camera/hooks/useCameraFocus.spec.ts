import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import type { Camera } from 'react-native-vision-camera';

import { useCameraFocus } from './useCameraFocus';

const asCameraRef = (ref: { current: { focus: jest.Mock } | null }) =>
  ref as unknown as React.RefObject<Camera | null>;

describe('useCameraFocus', () => {
  it('calls camera focus with tap coordinates', () => {
    const focus = jest.fn();
    const cameraRef = asCameraRef({ current: { focus } });

    const { result } = renderHook(() => useCameraFocus(cameraRef));

    act(() => {
      result.current.handleFocusTap(200, 400);
    });

    expect(focus).toHaveBeenCalledWith({ x: 200, y: 400 });
  });

  it('exposes focusIndicatorAnimatedStyle', () => {
    const cameraRef = asCameraRef({ current: { focus: jest.fn() } });

    const { result } = renderHook(() => useCameraFocus(cameraRef));

    expect(result.current.focusIndicatorAnimatedStyle).toBeDefined();
  });

  it('does not throw when camera ref has no current', () => {
    const cameraRef = asCameraRef({ current: null });

    const { result } = renderHook(() => useCameraFocus(cameraRef));

    expect(() => {
      act(() => {
        result.current.handleFocusTap(1, 2);
      });
    }).not.toThrow();
  });
});
