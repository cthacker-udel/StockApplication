import { SECRETS } from 'src/secrets/secrets';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/User';
import { UserService } from 'src/app/_services/user.service';
import { SessionCookie } from 'src/app/_models/SessionCookie';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  constructor(private userService: UserService) {}

  roleMapping: string[] = ['User', 'Admin', 'Super Admin'];
  user: User;
  role: string;

  ngOnInit(): void {
    const username = localStorage.getItem(
      SECRETS.STOCK_APP_SESSION_COOKIE_USERNAME_ID
    );
    if (username !== null) {
      const parsedUsername = JSON.parse(username) as SessionCookie;
      this.userService
        .getUserDataWithUsername(parsedUsername.value)
        .subscribe((partialUser: User) => {
          const { user } = partialUser as unknown as { user: User };
          const { dob, lastLogin } = user;
          const dateifiedDob = new Date(dob);
          const dateifiedLastLogin = new Date(lastLogin);
          const highestRole =
            this.roleMapping[Number.parseInt(user.roles[0], 10)];
          this.role = highestRole;
          this.user = {
            ...user,
            dob: `${dateifiedDob.getMonth()}/${dateifiedDob.getDay()}/${dateifiedDob.getFullYear()}`,
            lastLogin: `${dateifiedLastLogin.getMonth()}/${dateifiedLastLogin.getDay()}/${dateifiedLastLogin.getFullYear()} - ${dateifiedLastLogin.toLocaleTimeString()}`,
          };
        });
    }
  }
}
