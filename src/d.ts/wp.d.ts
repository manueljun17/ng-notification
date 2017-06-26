declare module "webPush" {
    export = webPush;
}
declare var webPush: webPush;
interface webPush {
    new():void;
    sendNotification(data:any,text:string,option:any);
}

