export default class User{
    username:string;
    uuid:string;
    loggedIn:boolean;

    constructor(username:string, userID:string, loggedIn:boolean){
        this.username = username
        this.userID = userID
        this.loggedIn = loggedIn
    }
}

//will look through database
export function isValidUsername(username:string):boolean{
    return false;
}

export function isValidPassword(password:string):boolean{
    return false;
}

export function authenticateLogin(username:string, password:string):boolean{
    return false
}

export function loginUser():User{
    return new User('name', "ID", false);
}

export function getUserNotifPerm(user:User):boolean{
    return false;
}

export function isSnoozeOn(user:User):boolean{
    return true;
}

function getUsersPassInDB(server:Object):string{
    return 'pending'
}