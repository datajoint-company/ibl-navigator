import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { MousePlotsService } from '../mouse-plots.service';
import { Subscription, Observable, Observer } from 'rxjs';
import { SuperGif } from '@wizpanda/super-gif';

@Component({
  selector: 'app-spinning-brain',
  templateUrl: './spinning-brain.component.html',
  styleUrls: ['./spinning-brain.component.css']
})

export class SpinningBrainComponent implements OnInit, OnDestroy {
  public mouse_uuid: string;
  private spinningBrainSubscription: Subscription;

  @Input() mouseInfo: Object;
  @ViewChild('brainGIF') brain_gif: ElementRef;
  spinningBrain: any;
  spinningBrainSrc: string = '';
  base64GIFsrc = '';

  constructor(public mousePlotsService: MousePlotsService) { }

  ngOnInit() {
    // 
    const fetchSpinningBrain = this.mousePlotsService.fetchSpinningBrain({'subject_uuid': this.mouseInfo['subject_uuid']}).subscribe({
      next: spinningBrain => {
        // console.log('spinning brain returned: ',spinningBrain[0]['subject_spinning_brain_link']);
        if (spinningBrain[0]) {
          this.spinningBrainSrc = spinningBrain[0]['subject_spinning_brain_link']
          // console.log(this.spinningBrainSrc)
          // this.convertToBase64(this.spinningBrainSrc).subscribe(base64data => {
          //   console.log('base64data: ', base64data);
          //   // this is the image as dataUrl
          //   this.base64GIFsrc = 'data:image/gif;base64,' + base64data;
          // });
        }
        
      },
      error: error => {
        console.log('error in retrieving spinning brain data');
        console.error(error);
      }
    })
    // once spinning brain link is set, load the player
    // Note on the player: The GIF has to be on the same domain (and port and protocol) as the page you're loading
    // this.loadSpinningBrainPlayer()
  }

  /* 
  ** returns base64 image url? from source url
  */
  convertToBase64(url: string) {
    // console.log('converting to base 64...')
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.src = url;
      if (!img.complete) {
          // This will call another method that will create image from url
          img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
           observer.error(err);
        };
      } else {
          observer.next(this.getBase64Image(img));
          observer.complete();
      }
    });
  }

  /* 
  ** creates base64 images from the image object that was created from the source url
  */
  getBase64Image(img: any) {
    // console.log('what is inside img: ', img)
    // Create a HTML canvas object that will create a 2d image - this needs to be tweaked to work on GIF instead
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    // This will draw image    
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    var dataURL = canvas.toDataURL("image/gif");
    return dataURL.replace(/^data:image\/(gif);base64,/, "");
 }

  loadSpinningBrainPlayer() {
    // console.log('attempting to load spinning brain super gif')
    let brainImage = this.brain_gif.nativeElement;
    // console.log('brainImage element: ', brainImage);
    this.spinningBrain = new SuperGif(brainImage, {autoPlay: true, maxWidth: 360});
    // console.log('what is in spinning brain: ', this.spinningBrain)
    this.spinningBrain.load(() => {
      // console.log('spinning brain in SuperGIF mode should now be loaded...');
    })
  }

  ngOnDestroy() {
    if (this.spinningBrainSubscription) {
      this.spinningBrainSubscription.unsubscribe();
    }
  }
}