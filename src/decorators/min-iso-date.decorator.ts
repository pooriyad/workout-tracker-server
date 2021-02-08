import { registerDecorator } from 'class-validator';
import { parseISO, isAfter } from 'date-fns';

export function MinISODate() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MinISODate',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          return isAfter(parseISO(value), new Date());
        },

        defaultMessage() {
          return '$property must be in future';
        },
      },
    });
  };
}
