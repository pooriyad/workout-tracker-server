export class UnprocessableError {
  /**
   * @example 422
   */
  status: number;
  /**
   * @example 'A weight record already exists for this date'
   * @example 'Adding weight record for future date is not allowed'
   */
  message: string;
  /**
   * @example 'Unprocessable Entity'
   */
  error: string;
}
