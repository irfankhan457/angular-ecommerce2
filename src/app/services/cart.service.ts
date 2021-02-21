import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  // subject is a subclass of observable we can use subject to publish events in our code.
  // the event will be sent to all of the subscribers
  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(theCartItem: CartItem) {

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if(this.cartItems.length > 0) {
        // find the item in the cart based on item id
        existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id)
        // check if we found it
        alreadyExistsInCart = (existingCartItem != undefined);
    }

    if(alreadyExistsInCart) {
      existingCartItem.quantity++;
    } else {
      //just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quanity
    this.computeCartTotals();
  }

  computeCartTotals() {
     let totalPriceValue: number = 0;
     let totalQuantityValue: number = 0;

     for(let currentCartItem  of this.cartItems) {
       totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
       totalQuantityValue += currentCartItem.quantity;
     }

     // Publish the new values ... all subscrive  will recieve the new data

     this.totalPrice.next(totalPriceValue);
     this.totalQuantity.next(totalQuantityValue);

     // log cart data just for  debugging purpose
     this.logCartData(totalPriceValue, totalQuantityValue);
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents Of the Cart');

    for(let tempCartItem  of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quanity:${tempCartItem.quantity}, 
                   unitePrice:${tempCartItem.unitPrice}, subtotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, 
                 totalQuantity: ${totalQuantityValue}`);
    console.log('------');
  }

  decreamentQuantity(tempCartItem: CartItem) {
    tempCartItem.quantity--;
    if(tempCartItem.quantity === 0) {
      this.remove(tempCartItem);
    } else {
      this.computeCartTotals();
    }
  }
  remove(tempCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(theCartItem => theCartItem.id == tempCartItem.id);

    // if find, remove the item from the array at the given index
    if(itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}
