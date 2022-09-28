class Notification{

}

const notificationHistory = []

export function addNotification(notif:Notification, hist:Notification[]): Notification[]{
    return hist;
}

export function sendNotification(): Notification{
    return new Notification()
}