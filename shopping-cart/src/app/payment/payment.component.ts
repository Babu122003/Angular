import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  total = 0;
  userName = '';
  paymentData = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.userName = user.name;
    this.total = this.cartService.getTotal();
    
    if (this.total === 0) {
      this.router.navigate(['/products']);
      return;
    }

    this.paymentData = `upi://pay?pa=6383393717-3@ibl&pn=${encodeURIComponent(this.userName)}&am=${this.total}&cu=INR&tn=${encodeURIComponent('Shopping Cart Payment')}`;
    this.generateQRCode();
  }

  generateQRCode() {
    setTimeout(() => {
      if (this.qrCanvas) {
        QRCode.toCanvas(this.qrCanvas.nativeElement, this.paymentData, { width: 250 }, (error) => {
          if (error) console.error(error);
        });
      }
    }, 100);
  }

  confirmPayment() {
    alert('Payment Successful!');
    this.cartService.clearCart();
    this.router.navigate(['/products']);
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}
