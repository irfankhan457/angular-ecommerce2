import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
 
  private baseUrl = 'http://localhost:8080/api/products';

  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) { }

  //*********************** PAGINATED URL SEARCH START *********************************//
  getProductListPagination(thePage: number, 
                           thePageSize: number, 
                           theCategoryId: number): Observable<GetResponseProducts> {

    //console.log(theCategoryId);
    const searchUrlPaginate = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                      + `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrlPaginate);
  }
   //*********************** PAGINATED URL SEARCH END *********************************//

  getProductList(theCategoryId: number): Observable<Product[]> {
      // @TODO: need to build URL based on category id ... will come
      console.log(theCategoryId);
      const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
      return this.getProducts(searchUrl);
    }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductsCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
      );
  }

  searchProducts(theKeyword: string): Observable<Product[]> {
    console.log(theKeyword);
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(theProductId: number): Observable<Product> {
    // Need to build URL based of Product ID
    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.httpClient.get<Product>(productUrl);

  }

    //*********************** Search PAGINATED URL SEARCH START *********************************//
    searchProductsPagination(thePage: number, 
                             thePageSize: number, 
                             theKeyword: string): Observable<GetResponseProducts> {

      // need to build URL based on keyword, page and size
      const searchUrlPaginate = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                              + `&page=${thePage}&size=${thePageSize}`;
                              
      return this.httpClient.get<GetResponseProducts>(searchUrlPaginate);
      }
  //*********************** Search PAGINATED URL SEARCH END *********************************//
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}


