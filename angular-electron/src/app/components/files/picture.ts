export class Picture {
  file: string;
  interestPoints: InterestPoint[];

  constructor(file: string, interestPoints: [InterestPoint]) {
    this.file = file;
    this.interestPoints = interestPoints;
  }
}

export class InterestPoint {
  width: number;
  height: number;
  top: number;
  left: number;
  pointTop: number;
  pointLeft: number;

  constructor(
    width: number,
    height: number,
    top: number,
    left: number,
    pointTop: number,
    pointLeft: number
  ) {
    this.width = width;
    this.height = height;
    this.top = top;
    this.left = left;
    this.pointTop = pointTop;
    this.pointLeft = pointLeft;
  }
}

export class Dimens {
  ratio: number;
  width: number;
  height: number;
  top: number;
  left: number;
  topGap: number;
  leftGap: number;

  constructor(
    ratio: number,
    width: number,
    height: number,
    top: number,
    left: number,
    topGap: number,
    leftGap: number
  ) {
    this.ratio = ratio;
    this.width = width;
    this.height = height;
    this.top = top;
    this.left = left;
    this.topGap = topGap;
    this.leftGap = leftGap;
  }
}
