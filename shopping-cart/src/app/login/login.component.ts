import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.http.get<User[]>('assets/users.json').subscribe(users => {
      const user = users.find(u => u.email === this.email && u.password === this.password);
      if (user) {
        this.authService.login(user);
        this.router.navigate(['/products']);
      } else {
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
