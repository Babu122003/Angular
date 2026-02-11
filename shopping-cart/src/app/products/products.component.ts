import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import { Product, CartItem } from '../product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  cartItems: CartItem[] = [];
  showCart = false;
  userName = '';

  constructor(
    private http: HttpClient,
    public cartService: CartService,
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

    this.http.get<Product[]>('assets/products.json').subscribe(data => {
      this.products = data;
    });

    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  removeFromCart(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, event: any) {
    const quantity = parseInt(event.target.value);
    this.cartService.updateQuantity(productId, quantity);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }

  clearCart() {
    this.cartService.clearCart();
  }

  checkout() {
    this.router.navigate(['/payment']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
  ///commit
}
