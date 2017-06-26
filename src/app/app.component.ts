/// <reference path="../d.ts/wp.d.ts" />
import { Component } from '@angular/core';
const applicationServerPublicKey = 'BPnN6nJ1vGsZaqZwSmLDNb659sCUzL0-SRcCSklgnFVsiMb-_Fi25_d6yslTmcvmDRRmjUEPWei2v2FlpZQqR60';
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
  constructor() {
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

      this.isSubscribed = true;
     
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
  
}
