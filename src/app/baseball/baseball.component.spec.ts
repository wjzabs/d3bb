import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseballComponent } from './baseball.component';

describe('BaseballComponent', () => {
  let component: BaseballComponent;
  let fixture: ComponentFixture<BaseballComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseballComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BaseballComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
