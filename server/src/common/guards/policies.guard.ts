import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

export interface PolicyHandler {
  handle(context: ExecutionContext): Promise<boolean> | boolean;
}

export type PolicyHandlerCallback = (context: ExecutionContext) => Promise<boolean> | boolean;

export type PolicyHandlerType = Type<PolicyHandler> | PolicyHandlerCallback;

export const POLICIES_KEY = 'policies';

export const CheckPolicies = (...handlers: PolicyHandlerType[]) => {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(POLICIES_KEY, handlers, descriptor?.value ?? target);
  };
};

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandlerType[]>(POLICIES_KEY, context.getHandler()) || [];

    if (policyHandlers.length === 0) {
      return true;
    }

    for (const handler of policyHandlers) {
      let result: boolean;

      if (typeof handler === 'function' && !this.isClass(handler)) {
        // It's a callback function
        result = await (handler as PolicyHandlerCallback)(context);
      } else {
        // It's a class
        const policyInstance = await this.moduleRef.resolve(handler as Type<PolicyHandler>);
        result = await policyInstance.handle(context);
      }

      if (!result) {
        throw new ForbiddenException('You do not have permission to perform this action');
      }
    }

    return true;
  }

  private isClass(func: unknown): boolean {
    return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
  }
}
