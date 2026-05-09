export class CreateOrderDto {
  storeId: string;
  customerId?: string;
  orderDate?: string;
  notes?: string;
  totalQty?: number;
  totalAmount?: number;
  status?: string;
  lines: CreateOrderLineDto[];
}

interface CreateOrderLineDto {
  productId: string;
  qty: number;
  price: number;
  discountAmount?: number;
  lineAmount?: number;
}