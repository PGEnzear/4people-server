import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as ApiModuleTypes } from "./ApiModuleTypes"

import "@src/api/rest/controllers/payment/PaymentController"
import "@src/api/rest/controllers/user/UserController"
import "@src/api/rest/controllers/game/GameController"

import { VerifyMiddleware } from "./rest/middlewares/verify";

const apiContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<VerifyMiddleware>(ApiModuleTypes.VerifyMiddleware).to(VerifyMiddleware);

});

const apiContainer = new Container({ defaultScope: "Singleton" });

apiContainer.load(apiContainerBindings);

export default apiContainer;