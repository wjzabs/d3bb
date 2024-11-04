import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
// import { AmeliaModule } from './amelia.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [], // AppComponent
    imports: [
        BrowserModule,

        HttpClientModule,
        BrowserAnimationsModule,
        // AmeliaModule,
    ],
    providers: [],
    bootstrap: [], // AppComponent
})
export class AppModule {
}
