import 'polyfills.ts';
import '@angular/core';
import '@angular/common';

import { AppModule } from './app/app.module';
import { platformWorkerAppDynamic } from '@angular/platform-webworker-dynamic';

platformWorkerAppDynamic().bootstrapModule(AppModule);