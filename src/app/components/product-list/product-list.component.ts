import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  //templateUrl: './product-list-table.component.html',
  //templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryID: number = 1;
  searchMode: boolean = false;
  previousCatergoryId: number = 1;

  // New Properties for Pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword: string = null;



  constructor(private productService: ProductService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=> {
      this.listProducts()
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode) {
      this.handleSearchProduct();
    } else {
      this.handleListProduct();
    }
   
  }
  handleSearchProduct() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    // if we have a different keyword than previous
    // then set the PageNumber to 1

    if(this.previousKeyword != theKeyword) {  
      this.theTotalElements = 1;
    }
    this.previousKeyword = theKeyword;
    
    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageSize}`);

    // now search for the products using keyword
    this.productService.searchProductsPagination(this.thePageNumber-1,
                                                 this.thePageSize,
                                                 theKeyword).subscribe(this.processResult());

    // Search the product Using Keyword
    //this.productService.searchProducts(theKeyword).subscribe(
    //   data => {
    //    this.products = data;
    //  })

  }

  handleListProduct() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    console.log(hasCategoryId);
    if(hasCategoryId) {
      // get the "id" param string, convert string to a number using the "+" symbol
      this.currentCategoryID = +this.route.snapshot.paramMap.get('id');
    } else {
      // not category id availbale ...  default to category id is 1
      this.currentCategoryID = 1;
    }

    //
    // check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a differnt category id than prious 
    // then set the the pageNumber back to 1
    if(this.previousCatergoryId != this.currentCategoryID) {
      this.thePageNumber = 1;

    }

    this.previousCatergoryId = this.currentCategoryID;

    console.log(`currentCategoryID=${this.currentCategoryID}, thePageNumber=${this.thePageNumber}`);



    // now get the products for the given Category id
    this.productService.getProductListPagination(this.thePageNumber - 1,
                                                 this.thePageSize,
                                                 this.currentCategoryID)
                                                 .subscribe(this.processResult());
    //this.productService.getProductList(this.currentCategoryID).subscribe(
    //  data => {
    //    this.products = data;
    //   })
  }
  processResult(){
      return data => {
          this.products = data._embedded.products;
          this.thePageNumber  = data.page.number + 1; // as spring data Rest is 0 base while Angular is 1 base
          this.thePageSize = data.page.size;
          this.theTotalElements = data.page.totalElements;
      }
  }

  updatePageSize(pageSize: number) {
      this.thePageSize = pageSize;
      this.thePageNumber = 1;
      this.listProducts();
  }

}
