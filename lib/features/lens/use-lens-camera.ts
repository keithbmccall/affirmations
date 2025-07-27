export const useLensCamera = () => {
  const devices = useCameraDevices();
  const device = useCameraDevice(cameraPosition, {
    physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera', 'telephoto-camera'],
  });
  console.log('device', device);
};
