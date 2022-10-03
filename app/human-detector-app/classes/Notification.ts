import Camera from './Camera';

/**
 * The Notification class accepts two parameters.  This class
 * describes a notification that was sent to a user.  These notifcation
 * will only be notification that are sent from cameras.  Other possible
 * notifications (if any) do not apply to the notification history.
 */
export default class Notification {
  notifDate: string;

  notifSentFrom: Camera;

  /**
   * @param notifDate: The date and time that the notificfation was sent.
   * @param notifSentFrom: The camera that sent the specific notification
   */
  constructor(notifDate: string, notifSentFrom: Camera) {
    this.notifDate = notifDate;
    this.notifSentFrom = notifSentFrom;
  }
}
