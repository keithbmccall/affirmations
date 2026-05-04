import { clampTranslateX, resolveSwipePositionOnEnd } from './workletGestures';

describe('clampTranslateX', () => {
  it('clamps to left edge', () => {
    expect(clampTranslateX(0, -500, 0, 100)).toBe(0);
  });

  it('clamps to right edge', () => {
    expect(clampTranslateX(50, 500, 0, 100)).toBe(100);
  });

  it('returns gesture start plus translation when in range', () => {
    expect(clampTranslateX(10, 20, 0, 100)).toBe(30);
  });
});

describe('resolveSwipePositionOnEnd', () => {
  const left = 0;
  const right = -80;

  describe('when row was open (gestureStartX === leftEdge)', () => {
    it('closes when translateX > -120', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -50,
          gestureStartX: left,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: right, shouldBeOpen: false });
    });

    it('stays open when translateX <= -120', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -120,
          gestureStartX: left,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: left, shouldBeOpen: true });
    });

    it('stays open when translateX < -120', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -200,
          gestureStartX: left,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: left, shouldBeOpen: true });
    });
  });

  describe('when row was closed (gestureStartX !== leftEdge)', () => {
    it('opens when translateX < -40', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -41,
          gestureStartX: right,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: left, shouldBeOpen: true });
    });

    it('stays closed when translateX >= -40', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: -40,
          gestureStartX: right,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: right, shouldBeOpen: false });
    });

    it('stays closed when translateX is positive', () => {
      expect(
        resolveSwipePositionOnEnd({
          translateX: 10,
          gestureStartX: right,
          leftEdge: left,
          rightEdge: right,
        })
      ).toEqual({ targetX: right, shouldBeOpen: false });
    });
  });
});
