'use strict';
var userlevel = "user";
self.addEventListener('install', function(event) {
  // Perform install steps
});
self.addEventListener('message', function(event) {
    var data = event.data;

    if (data.command == "oneWayCommunication") {
        console.log("Message the Page : ", data.message);
    } 
    if (data.command == "userLevel") {
        console.log("User Level : ", data.level);
        userlevel = data.level;
    } 
});
self.addEventListener('push', function(event) {
  if(userlevel != "admin") return;
  console.log(event);
  console.log("user level:",userlevel);
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
  const title = 'English Website';
  var msg = event.data.text() ? event.data.text():'Yay it works.';
  const options = {
    body: msg,
    icon: './assets/js/images/icon.png',
    badge: './assets/js/images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});