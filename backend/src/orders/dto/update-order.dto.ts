export class UpdateOrderDto {
  storeId?: string;
  customerId?: string;
  orderDate?: string;
  notes?: string;
  status?: string;
  lines?: UpdateOrderLineDto[];
}

interface UpdateOrderLineDto {
  productId: string;
  qty: number;
  price: number;
  discountAmount?: number;
  lineAmount?: number;
}