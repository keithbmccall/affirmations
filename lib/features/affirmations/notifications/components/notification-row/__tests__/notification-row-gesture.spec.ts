import {
  clampTranslateX,
  resolveSwipePositionOnEnd,
} from '../notification-row-gesture';
import { NOTIFICATION_ROW_CONFIG } from '../notification-row.config';

describe('notification-row-gesture', () => {
  const { leftEdge, rightEdge } = NOTIFICATION_ROW_CONFIG;

  describe('clampTranslateX', () => {
    it('clamps to right edge when translation is positive from zero', () => {
      expect(clampTranslateX(0, 50, leftEdge, rightEdge)).toBe(rightEdge);
    });

    it('clamps to left edge when swiped far left', () => {
      expect(clampTranslateX(0, -500, leftEdge, rightEdge)).toBe(leftEdge);
    });
  });

  describe('resolveSwipePositionOnEnd', () => {
    it('when already open and translateX above -120, closes', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -100,
          gestureStartX: leftEdge,
          leftEdge,
          rightEdge,
        })
      ).toEqual({ targetX: rightEdge, shouldBeOpen: false });
    });

    it('when already open and translateX at or below -120, stays open', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -130,
          gestureStartX: leftEdge,
          leftEdge,
          rightEdge,
        })
      ).toEqual({ targetX: leftEdge, shouldBeOpen: true });
    });

    it('when closed and translateX below -40, opens', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -50,
          gestureStartX: rightEdge,
          leftEdge,
          rightEdge,
        })
      ).toEqual({ targetX: leftEdge, shouldBeOpen: true });
    });

    it('when closed and translateX at or above -40, stays closed', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -30,
          gestureStartX: rightEdge,
          leftEdge,
          rightEdge,
        })
      ).toEqual({ targetX: rightEdge, shouldBeOpen: false });
    });
  });
});
