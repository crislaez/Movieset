import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NoDataComponent } from '@movieset/ui/no-data';
import { SpinnerComponent } from '@movieset/ui/spinner/spinner.component';
import { SwiperComponent } from '@movieset/ui/swiper/swiper.component';
import { TranslateModule } from '@ngx-translate/core';
import { HomeComponent } from './containers/home.component';
import { HomeRoutingModule } from './home-routing.module';


const UIComponents = [
  // SpinnerComponent,
  SwiperComponent,
  SpinnerComponent,
  NoDataComponent,
  // ItemCardModule,
  // FilterModalModule,
  // InfiniteScrollModule,
];


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ...UIComponents,
    TranslateModule.forChild(),
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule {}
