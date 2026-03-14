import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { CollectionModule } from './collection/collection.module';
import { RequestModule } from './request/request.module';
import { EnvironmentModule } from './environment/environment.module';
import { HistoryModule } from './history/history.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [
    FirebaseModule,
    WorkspaceModule,
    CollectionModule,
    RequestModule,
    EnvironmentModule,
    HistoryModule,
    InvitationModule,
  ],
})
export class AppModule {}
