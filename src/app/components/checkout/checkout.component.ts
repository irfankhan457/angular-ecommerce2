import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Shop2GwaliorFormService } from 'src/app/services/shop2-gwalior-form.service';

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
              private shop2GwaliorFormService: Shop2GwaliorFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
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
  }

  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer').value)

    console.log("The Email address is: "+this.checkoutFormGroup.get('customer').value.email);

    console.log("The Shipping address is: "+this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("The Shipping address Staet is: "+this.checkoutFormGroup.get('shippingAddress').value.state.name);
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
}
