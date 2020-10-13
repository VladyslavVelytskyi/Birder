/* root component starts here */
require('../../src/assets/less/main.less'); // include general styles


var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 	
const AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;

class Header {
  constructor(toggleMenu) {
    this.menuButton = document.getElementById('menu-button');
    this.header = document.getElementById('header');

    this.toggleMenu = toggleMenu;

    this.menuButton.addEventListener('click', this.toggleMenu);

    return this.header;
  }
}

class ListenBlock {
  constructor() {
    this.startListenButton = document.getElementById('startListen');
    //this.stopListenButton = document.getElementById('stopListen');
    this.loaderBox = document.querySelector('.loader');

    this.mediaRecorder;
    this.intervalId;

    this.angle = 0;
    this.listen();
    this.startListenButton.addEventListener('click', this.onStart.bind(this));
    //this.stopListenButton.addEventListener('click', this.onStop.bind(this));
  }

  onStart() {
    this.startRecording();
    this.swapButtons();
    this.intervalId = setInterval(this.rotate.bind(this), 10);

    setTimeout(this.onStop.bind(this), 6000);
  }

  onStop() {
    clearInterval(this.intervalId);
    this.swapButtons();
    this.rotate(360);
    this.angle = 0;
    this.stopRecording();
    /*
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    */
  }

  listen() {
    const self = this;
/*
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream => {
        this.mediaRecorder = new MediaRecorder(stream);

  
        const chunk = [];
  
        this.mediaRecorder.addEventListener('dataavailable', e => {
          console.log(chunk);
          chunk.push(e.data);
        });
  
        this.mediaRecorder.addEventListener('stop', () => {
          const blob = new Blob(chunk, {
            type: 'audio/wav',
          });
          const fd = new FormData();

          fd.append('audio_data', blob, new Date().toISOString());

          fetch('http://127.0.0.1:5000/uploadfile', {
            method: 'POST',
            body: fd,
            mode: 'no-cors',
          })
            .then(response => response.json())
            .then(data => {
              renderBird(data);
              //place for render function which should draw Bird Page
              // { name, description. imageUrl }
              console.log(data);
            })
            .catch(e => console.log(e));
        });
  
        setTimeout(this.onStop.bind(this), 6000);
      }).bind(self))
      .catch(e => console.log(`Error: ${e}`));

      */
    /*navigator.mediaDevices.getUserMedia({audio: true})
      .then(stream => recorder.init(stream))
      .catch(err => console.log('Uh oh... unable to get stream...', err));
 */
    
  }

  startRecording() {
    var constraints = { audio: true, video:false }

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
  
      /*
        create an audio context after getUserMedia is called
        sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
        the sampleRate defaults to the one set in your OS for your playback device
      */
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
      //update the format 
      //document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"
  
      /*  assign to gumStream for later use  */
      gumStream = stream;
      
      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);
  
      /* 
        Create the Recorder object and configure to record mono sound (1 channel)
        Recording 2 channels  will double the file size
      */
      rec = new Recorder(input,{numChannels:1})
      console.log(rec);
      //start the recording process
      rec.record()
  
      console.log("Recording started");
  
    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        //recordButton.disabled = false;
        //stopButton.disabled = true;
        //pauseButton.disabled = true
        console.log(err);
    });
  }

  stopRecording() {
    rec.stop();
  
    gumStream.getAudioTracks()[0].stop();

    rec.exportWAV((blob) => {
      const fd = new FormData();

      fd.append('audio_data', blob, new Date().toISOString());
      console.log(blob);
      fetch('http://127.0.0.1:5000/uploadfile', {
        method: 'POST',
        body: fd,
        mode: 'no-cors',
      })
        .then(response => response.json())
        .then(data => {
         
          //place for render function which should draw Bird Page
          // { name, description. imageUrl }
          console.log(data);
        })
        .catch(e => console.log(e));
    });
  }

  rotate(angle) {
    this.angle = angle || this.angle;

    this.loaderBox.querySelector('.loader__piece.right').style.transform = `rotate(${this.angle}deg)`;

    if (this.angle === 0) {
      this.loaderBox.classList.add('timer');   
    }

    if (this.angle >= 180) {
      this.loaderBox.classList.add('over_50');
    } else {
      this.loaderBox.classList.remove('over_50');
    }

    this.angle += 0.6; //
  };

  swapButtons() {
    this.startListenButton.classList.toggle('display-none');
    //this.stopListenButton.classList.toggle('display-none');
  }
}

class BirdBlock {

}

class Main {
  constructor(clickOnEnterScreen) {
    this.enterScreen = document.getElementById('enter');
    this.listenBoxScreen = document.getElementById('listenBox');

    this.listenBlock = new ListenBlock();
    this.birdBlock = new BirdBlock();

    this.enterScreen.addEventListener('click', () => {
      clickOnEnterScreen(this.enterScreen, this.listenBoxScreen);
    });
  }
}

class Route {
  constructor(hash, page) {
    this.routeName = hash || '#listenBox';
    this.page = page;

    this.element = document.getElementById(hash.substr(1));
  }

  render() {
    console.log(this.element);
    this.element.classList.remove('display-none');
  }
} 

class Router {
  constructor() {
    this.routes = [
      new Route('#app'),
      new Route('#history'),
      new Route('#settings'),
      new Route('#save'),
      new Route('#listenBox'),
      //new Route('#bird'),
    ];
  }
}

class Body {
  constructor(router) {
    this.body = document.querySelector('body');
    this.header = new Header(this.toggleMenu.bind(this));
    this.main = new Main(this.clickOnEnterScreen.bind(this));
    this.router = router;

    this.header.addEventListener('click', this.clickOnLink.bind(this), false);

    return this.body;
  }

  toggleMenu() {
    this.header.classList.toggle('header--open');
    this.body.classList.toggle('menu');
  }

  clickOnEnterScreen(enterScreen, listenBoxScreen) {
    enterScreen.classList.add('enter--action');
    this.header.classList.remove('header--hidden');

    setTimeout((() => {
      this.header.classList.add('header--visible');
  
      enterScreen.classList.add('display-none');
      listenBoxScreen.classList.remove('display-none');
    }).bind(this), 500);
  };

  clickOnLink(e) {
    if (e.target.tagName === 'A') {
      const hash = e.target.getAttribute('href');

      this.moveToPage(hash);
    }
  };

  moveToPage(hash) {
    const route = this.router.routes.find(route => route.routeName === hash);

    [...document.querySelectorAll('.main__block')].forEach(element => {
      if (element !== route.element) {
        element.classList.add('display-none');
      } else { 
        element.classList.remove('display-none');
      }
    });

    this.toggleMenu();
  }
}

class App {
  constructor(Router, Body) {
    this.router = new Router();
    this.body = new Body(this.router);
  }
}

const app = new App(Router, Body);
