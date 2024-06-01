import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as AppModuleTypes } from "./AppModuleTypes"

import { PaymentService } from "./payment/PaymentService"
import { UserService } from "./user/UserService";
import { GameService } from "./game/GameService";
import { GameRepository } from "./game/GameRepository";
import { UserRepository } from "./user/UserRepository";

const appContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<UserService>(AppModuleTypes.UserService).to(UserService);
    bind<PaymentService>(AppModuleTypes.PaymentService).to(PaymentService);
    bind<GameService>(AppModuleTypes.GameService).to(GameService);
    bind<GameRepository>(AppModuleTypes.GameRepository).to(GameRepository);
    bind<UserRepository>(AppModuleTypes.UserRepository).to(UserRepository);

});

const appContainer = new Container({ defaultScope: "Singleton" });

appContainer.load(appContainerBindings);

export default appContainer;