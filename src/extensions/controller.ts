export interface IController {}
export interface IService {}

export type MultipleServices<TService extends IService> = {
  [serviceKey: string]: TService
}

export type ControllerResolverOptions<TController extends IController, TService extends IService> = {
  controller: TController
  service: IService | MultipleServices<TService>
}
export abstract class ControllerResolver<TController extends IController> {
  controller: TController
  constructor(controller: TController) {
    this.controller = controller
  }
}
