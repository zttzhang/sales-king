export class CreateOrderLineDto {
  productId: string;
  qty: number;
  price: number;
  discountAmount?: number;
  lineAmount?: number;
}