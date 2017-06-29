import { Http, RequestOptions, Headers } from '@angular/http';
import { Component } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
const url = "http://localhost:8080/api/trigger-push-msg";
const applicationServerPublicKey = 'BNzNJai0BhWggRnf4ehKwHXLB9q_1At6mfw-mLzB2ieE-bgLdhl1HuDdJ70SH80nUkSOJtbZqOVjgLXlFXme2h0';
// const applicationServerPublicKey = 'BPnN6nJ1vGsZaqZwSmLDNb659sCUzL0-SRcCSklgnFVsiMb-_Fi25_d6yslTmcvmDRRmjUEPWei2v2FlpZQqR60';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  subscribeInfo: any = null;
  title: string = 'app works!';
  subscribeButtonText: string = 'Enable Push Messaging';
  notif:Notification;
  swRegistration = null;
  isSubscribed: boolean = false;
  isDisabled: boolean = false;
  displaySubscribe: boolean = false;
  subscribers: FirebaseListObservable<any[]>;
  constructor(
    public http: Http,
    db: AngularFireDatabase
  ) {
      this.subscribers = db.list('/subscriber');
      this.subscribers
        .subscribe(snapshots => {
          snapshots.forEach(snapshot => {
            console.log(JSON.parse(snapshot.$value));
          });
        })
      
  }
  sendPushOnRegister( ) {
    let data: any ={message: "Someone Register!!!" };
    this.postPush( data );
  }
  sendPushOnMessage( ) {
    let data: any ={message: "Someone Message on the chat!!!" };
    this.postPush( data );
  }
  postPush( data ) {
    data = this.buildQuery(data);
    let myurl = url + '?' + data;
    console.log("url:",myurl);
    this.http.post(myurl,data,this.requestOptions).subscribe((re)=> {
      console.log(re);
    })
  }
  ngOnInit() {
    
    this.init();
  }
  onClickChangeUserLevel(level) {
     if (navigator.serviceWorker.controller) {
        console.log("Sendingage to service worker");
        navigator.serviceWorker.controller.postMessage({
            "command": "userLevel",
            "level": level
        });
      } else {
        console.log("No ServiceWorker");
      }
  }
  init() {
    console.log("First Initialize");
    if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('service-worker.js')
    .then((swReg)=> {
      console.log('Service Worker is registered', swReg);

      this.swRegistration = swReg;
      this.initialiseUI();
    })
    .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    } else {
      console.warn('Push messaging is not supported');
      this.subscribeButtonText = 'Push Not Supported';
    }
  }
  onClickSubscribe() {
    this.isDisabled = true;
    if ( this.isSubscribed ) {
      this.unsubscribeUser();
    } else {
      this.subscribeUser();
    }
  }
  initialiseUI() {
 
    // Set the initial subscription value
    this.swRegistration.pushManager.getSubscription()
    .then((subscription)=> {
      this.isSubscribed = !(subscription === null);
      this.updateSubscriptionOnServer(subscription);

      if ( this.isSubscribed ) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }

      this.updateBtn();
    });
  }
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  updateBtn() {
    if (Notification['permission'] === 'denied') {
      this.subscribeButtonText = 'Push Messaging Blocked.';
      this.isDisabled = true;
      // updateSubscriptionOnServer(null);
      return;
    }

    if ( this.isSubscribed) {
      this.subscribeButtonText = 'Disable Push Messaging';
    } else {
      this.subscribeButtonText = 'Enable Push Messaging';
    }

    this.isDisabled = false;
  }
  updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    if (subscription) {
      console.log(subscription);
      this.displaySubscribe = true;
      this.subscribeInfo = JSON.stringify(subscription);
    } else {
      this.displaySubscribe = false;
    }
  }

  subscribeUser() {
    let applicationServerKey = this.urlB64ToUint8Array(applicationServerPublicKey);
    this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then((subscription)=> {
      console.log('User is subscribed.');

      this.updateSubscriptionOnServer(subscription);
      console.log(subscription);
      this.isSubscribed = true;
      this.subscribers.push(  JSON.stringify(subscription) );
      this.updateBtn();
    })
    .catch((err)=> {
      console.log('Failed to subscribe the user: ', err);
      this.updateBtn();
    });
  }
  unsubscribeUser() {
    this.swRegistration.pushManager.getSubscription()
    .then((subscription)=> {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch((error)=> {
      console.log('Error unsubscribing', error);
    })
    .then(()=> {
      this.updateSubscriptionOnServer(null);

      console.log('User is unsubscribed.');
      this.isSubscribed = false;

      this.updateBtn();
    });
  }

  get requestOptions() : RequestOptions {
        let headers  = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options  = new RequestOptions({ headers: headers });
        return options;
    }
    protected buildQuery( params ) {
    // params[ 'module' ] = 'ajax'; // 'module' must be ajax.
    // params[ 'submit' ] = 1; // all submit must send 'submit'=1
    return this.http_build_query( params );
  }
  protected http_build_query (formdata, numericPrefix='', argSeparator='') {
    var urlencode = this.urlencode;
    var value
    var key
    var tmp = []
    var _httpBuildQueryHelper = function (key, val, argSeparator) {
      var k
      var tmp = []
      if (val === true) {
        val = '1'
      } else if (val === false) {
        val = '0'
      }
      if (val !== null) {
        if (typeof val === 'object') {
          for (k in val) {
            if (val[k] !== null) {
              tmp.push(_httpBuildQueryHelper(key + '[' + k + ']', val[k], argSeparator))
            }
          }
          return tmp.join(argSeparator)
        } else if (typeof val !== 'function') {
          return urlencode(key) + '=' + urlencode(val)
        } else {
          throw new Error('There was an error processing for http_build_query().')
        }
      } else {
        return ''
      }
    }

    if (!argSeparator) {
      argSeparator = '&'
    }
    for (key in formdata) {
      value = formdata[key]
      if (numericPrefix && !isNaN(key)) {
        key = String(numericPrefix) + key
      }
      var query = _httpBuildQueryHelper(key, value, argSeparator)
      if (query !== '') {
        tmp.push(query)
      }
    }

    return tmp.join(argSeparator)
  }
protected urlencode (str) {
    str = (str + '')
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+')
  }
  
}
