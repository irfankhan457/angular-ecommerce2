import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class Shop2GwaliorFormService {

  private countriesUrl = "http://localhost:8080/api/countries";
  private stateUrl = "http://localhost:8080/api/states";

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    // build an array for "Month" dropdown list
    // - start at desired startMonth and loop until 12
    for(let theMonth = startMonth; theMonth <=12; theMonth++) {
      data.push(theMonth);
    }
    // to wrap data as obersevable we use of
    return of(data);
  }

  getCreditCardYear(): Observable<number[]> {
    let data: number[] = [];

    // build an array for "year" dropdown list
    // - start at current year and loop for next 10 
    //
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for(let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }

    return of(data);
  }

  getStates(theCountryCode: string) : Observable<State[]> {
    // search URL
    const searchStateUrl = `${this.stateUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  getCountries() : Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }
}

// it is use for Unwrap the Json from Spring Data Rest _embedded entry 
// which is we are getting spring response which start with _embedded
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}