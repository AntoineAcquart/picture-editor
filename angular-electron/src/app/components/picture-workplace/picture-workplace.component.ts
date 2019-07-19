import {
  Component,
  OnInit,
  Input,
  ElementRef,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Picture, InterestPoint, Dimens } from '../files/picture';
import {
  unlinkSync,
  readdir,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-picture-workplace',
  templateUrl: './picture-workplace.component.html',
  styleUrls: ['./picture-workplace.component.scss']
})
export class PictureWorkplaceComponent implements OnChanges {
  private path: string = process.cwd() + '/src/assets/user-data/';
  private currentPicture: Partial<Picture> = {};
  private dimens: Dimens;
  private initialWidth;
  private initialHeight;
  constructor(private elRef: ElementRef, private _domSanitizer: DomSanitizer) {}
  @Input() picturePath: string;

  ngOnChanges(changes: SimpleChanges) {
    delete this.dimens;
    delete this.initialWidth;
    delete this.initialHeight;
    this.dimens = new Dimens(null, null, null, null, null, 0, 0);
    this.loadPicture(changes.picturePath.currentValue);
    console.log(this);
  }

  private deletePicture() {
    const file = this.currentPicture.file;
    const pictures: [Picture] = JSON.parse(
      readFileSync(
        process.cwd() + '/src/assets/user-data/interest-points.json',
        'utf-8'
      )
    );
    pictures.forEach(picture => {
      if (picture.file.toLowerCase() === file.toLowerCase()) {
        pictures.splice(pictures.findIndex(value => value === picture));
      }
    });

    const json = JSON.stringify(pictures);

    writeFileSync(
      process.cwd() + '/src/assets/user-data/interest-points.json',
      json,
      'utf8'
    );
    unlinkSync(file);
  }

  private saveInterestPoint() {
    const file = this.currentPicture.file;
    const pictures: [Picture] = JSON.parse(
      readFileSync(
        process.cwd() + '/src/assets/user-data/interest-points.json',
        'utf-8'
      )
    );
    pictures.forEach(picture => {
      if (picture.file.toLowerCase() === file.toLowerCase()) {
        let pointTop;
        let pointLeft;

        pointTop = -(
          (this.dimens.top * this.initialHeight) / this.dimens.height +
          this.initialHeight / 2
        );

        pointLeft = -(
          (this.dimens.left * this.initialWidth) / this.dimens.width +
          this.initialWidth / 2
        );

        picture.interestPoints.push(
          new InterestPoint(
            this.dimens.width,
            this.dimens.height,
            this.dimens.top,
            this.dimens.left,
            pointTop,
            pointLeft
          )
        );
      }
    });

    const json = JSON.stringify(pictures);

    writeFileSync(
      process.cwd() + '/src/assets/user-data/interest-points.json',
      json,
      'utf8'
    );
  }

  private loadInterstZoom(interestPoint) {
    this.dimens.width = interestPoint.width;
    this.dimens.height = interestPoint.height;
    this.dimens.top = interestPoint.top;
    this.dimens.left = interestPoint.left;
  }

  private loadPicture(file: string) {
    this.currentPicture.file = file;
    this.currentPicture.interestPoints = this.loadInterestPoints(file);
    this.loadZoom();
  }

  private loadInterestPoints(file): [InterestPoint] {
    const jsonData: JSON = JSON.parse(
      readFileSync(this.path + 'interest-points.json', 'utf-8')
    );

    for (const picture in jsonData) {
      if (jsonData[picture].file === file) {
        return jsonData[picture].interestPoints;
      }
    }
  }

  private async loadZoom() {
    const box = await this.elRef.nativeElement.querySelector(
      '.picture-zoombox'
    );
    const img = await this.elRef.nativeElement.querySelector(
      '.zoombox-center img'
    );

    this.dimens.ratio = img.offsetWidth / img.offsetHeight;

    if (this.dimens.ratio > 1) {
      this.dimens.width = box.offsetWidth;
      this.dimens.height = this.dimens.width / this.dimens.ratio;
    } else {
      this.dimens.height = box.offsetHeight;
      this.dimens.width = this.dimens.height * this.dimens.ratio;
    }

    this.initialWidth = this.dimens.width;
    this.initialHeight = this.dimens.height;

    this.adapteWithRatio();
  }

  private adapteWithRatio() {
    if (this.dimens.ratio > 1) {
      this.dimens.height = this.dimens.width / this.dimens.ratio;
    } else {
      this.dimens.width = this.dimens.height * this.dimens.ratio;
    }

    const box = this.elRef.nativeElement.querySelector('.picture-zoombox');

    if (
      box.offsetHeight / 2 > -this.dimens.top ||
      box.offsetHeight / 2 > this.dimens.height + this.dimens.top
    ) {
      this.dimens.topGap = 0;
    }

    if (
      box.offsetWidth / 2 > -this.dimens.left ||
      box.offsetWidth / 2 > this.dimens.width + this.dimens.left
    ) {
      this.dimens.leftGap = 0;
    }

    this.dimens.top = -(this.dimens.height / 2) + this.dimens.topGap;
    this.dimens.left = -(this.dimens.width / 2) + this.dimens.leftGap;
  }

  private mouseWheelUpFunc() {
    if (this.dimens.ratio > 1) {
      this.dimens.width = this.dimens.width + 50;
    } else {
      this.dimens.height = this.dimens.height + 50;
    }

    this.adapteWithRatio();
  }

  private mouseWheelDownFunc() {
    const box = this.elRef.nativeElement.querySelector('.picture-zoombox');
    if (this.dimens.ratio > 1) {
      if (this.dimens.width > box.offsetWidth) {
        this.dimens.width = this.dimens.width - 50;
        this.adapteWithRatio();
      }
    } else {
      if (this.dimens.height > box.offsetHeight) {
        this.dimens.height = this.dimens.height - 50;
        this.adapteWithRatio();
      }
    }
  }

  private keyFunc(event) {
    const box = this.elRef.nativeElement.querySelector('.picture-zoombox');

    switch (event.key) {
      case 'ArrowUp':
        if (box.offsetHeight / 2 + 50 < -this.dimens.top) {
          this.dimens.topGap = this.dimens.topGap + 50;
        }
        break;
      case 'ArrowDown':
        if (box.offsetHeight / 2 + 50 < this.dimens.height + this.dimens.top) {
          this.dimens.topGap = this.dimens.topGap - 50;
        }
        break;
      case 'ArrowLeft':
        if (box.offsetWidth / 2 + 50 < -this.dimens.left) {
          this.dimens.leftGap = this.dimens.leftGap + 50;
        }
        break;
      case 'ArrowRight':
        if (box.offsetWidth / 2 + 50 < this.dimens.width + this.dimens.left) {
          this.dimens.leftGap = this.dimens.leftGap - 50;
        }
        break;
      default:
        break;
    }
    this.adapteWithRatio();
  }
}
