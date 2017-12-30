/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { AppModule } from './app/app.module';
import { bootstrapWorkerUi } from '@angular/platform-webworker';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapWorkerUi('webworker.bundle.js')
  .catch(err => console.log(err));
