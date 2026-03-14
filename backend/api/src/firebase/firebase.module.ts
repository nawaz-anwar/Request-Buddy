import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [FirebaseService, AuthGuard],
  exports: [FirebaseService, AuthGuard],
})
export class FirebaseModule {}
