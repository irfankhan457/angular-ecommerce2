import { TestBed } from '@angular/core/testing';

import { Shop2GwaliorFormService } from './shop2-gwalior-form.service';

describe('Shop2GwaliorFormService', () => {
  let service: Shop2GwaliorFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Shop2GwaliorFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
