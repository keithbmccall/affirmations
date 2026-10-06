import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import type { CameraRef } from 'react-native-vision-camera';
import { useCameraFocus } from './useCameraFocus';

const asCameraRef = (ref: { current: { focusTo: jest.Mock } | null }) =>
  ref as unknown as React.RefObject<CameraRef | null>;

describe('useCameraFocus', () => {
  it('calls camera focusTo with tap coordinates', () => {
    const focusTo = jest.fn();
    const cameraRef = asCameraRef({ current: { focusTo } });

    const { result } = renderHook(() => useCameraFocus(cameraRef));

    act(() => {
      result.current.handleFocusTap(200, 400);
    });

    expect(focusTo).toHaveBeenCalledWith({ x: 200, y: 400 });
  });

  it('exposes focusIndicatorAnimatedStyle', () => {
    const cameraRef = asCameraRef({ current: { focusTo: jest.fn() } });

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
