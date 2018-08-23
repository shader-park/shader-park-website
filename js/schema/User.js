export class User {
    constructor(username, email) {
        this.username = username;
        this.created = Date.now();
        this.email = email;
        this.website = null;
        this.bio = null;
        this["profile-picture"] = null;
        this.favorites = [];
        this.sketches = [];
        this.followers = [];
        this.following = [];
        this.notifications = [];
    }
}