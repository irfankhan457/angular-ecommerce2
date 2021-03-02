import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Shop2GwaliorFormService } from 'src/app/services/shop2-gwalior-form.service';
import { Shop2GwaliorValidators } from 'src/app/validators/shop2-gwalior-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [] 

  constructor(private formBuilder: FormBuilder,
              private shop2GwaliorFormService: Shop2GwaliorFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        lastName:  new FormControl('', [Validators.required, Validators.minLength(1), Shop2GwaliorValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Shop2GwaliorValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // Populate Credit Card Months
    const startMonth: number =  new Date().getMonth() + 1;  // as Angular 0 is base month 0-11 so we have to add +1
    console.log(startMonth);

    this.shop2GwaliorFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved Credit card months: "+ JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // Populate Credit Card Year
    this.shop2GwaliorFormService.getCreditCardYear().subscribe(
      data => {
        console.log("Retrieved Credit card Year: "+ JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // Populate Countries
    this.shop2GwaliorFormService.getCountries().subscribe(
      data => {
        console.log("Retrieve Countries: "+ JSON.stringify(data));
        this.countries = data;
      }
    );

    this.reviewCartDetails();
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    )

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    )
  }

  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log("The Email address is: "+this.checkoutFormGroup.get('customer').value.email);
    console.log("The Shipping address is: "+this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("The Shipping address Staet is: "+this.checkoutFormGroup.get('shippingAddress').value.state.name);

    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart item
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - Long way
    /*let orderItems: OrderItem[] = [];
    for(let i=0; i < cartItems.length; i++) {
        orderItems[i] = new OrderItem(cartItems[i]);
    }*/

    // - Short Way
    let orderItems : OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;


    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    console.log(shippingState.name);
    console.log(shippingCountry.name);
    
    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country))
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    console.log(billingState.name);
    console.log(billingCountry.name);


    // populate purchase - order and order Items
    // purchase.order = this.checkoutFormGroup.controls['order'].value;
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call Rest API  via the checkout Service
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your Order has been Received.\nOrder Tracking Number: ${response.orderTrackingNumber}`)

          // reset Cart
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`)
        }
      }
    );


  }
  resetCart() {
    // reset Cart Data
    this.cartService.cartItems = [];
    this.cartService.totalQuantity.next(0);
    this.cartService.totalQuantity.next(0);


    // reset the form data
    this.checkoutFormGroup.reset();

    // navigate back to the products Page
    this.router.navigateByUrl("/products");
  }

  copyShippingAddressToBillingAddress(event) {
    if(event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
            .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      // bug fix for states 
      this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      // bug fix for states
      this.billingAddressStates = [];
    }
  }

  handleMonthAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get("creditCard");

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // if the current year equal to the selected Year, than Start with current Month

    let startMonth: number;

    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.shop2GwaliorFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved Credit card months: "+ JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  // Get state According to the Country
  getState(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;

    this.shop2GwaliorFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName == 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
      }
    );
  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() {return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


  
}
