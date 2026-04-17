import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneProperty', async: false })
export class AtLeastOnePropertyConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    return Object.keys(object).length > 0;
  }

  defaultMessage() {
    return 'At least one field must be provided';
  }
}

export function AtLeastOneProperty(validationOptions?: ValidationOptions) {
  return function (constructor: new (...args: any[]) => any) {
    registerDecorator({
      target: constructor,
      propertyName: constructor.name,
      options: validationOptions,
      constraints: [],
      validator: AtLeastOnePropertyConstraint,
    });
  };
}
