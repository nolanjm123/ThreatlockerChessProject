import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSetupModalComponent } from './player-setup-modal.component';

describe('PlayerSetupModalComponent', () => {
  let component: PlayerSetupModalComponent;
  let fixture: ComponentFixture<PlayerSetupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSetupModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerSetupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
