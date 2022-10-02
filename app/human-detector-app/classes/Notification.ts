import Camera from './Camera';

export default class Notification {
  notifDate: string; //Date and time of notification sent
  notifSentFrom: Camera; // Camera that sent this specific notification

  constructor(notifDate: string, notifSentFrom: Camera) {
    this.notifDate = notifDate;
    this.notifSentFrom = notifSentFrom;
  }
}
