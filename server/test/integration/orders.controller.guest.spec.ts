import { Test } from '@nestjs/testing';
import { OrdersController } from '@modules/orders/orders.controller';
import { OrdersService } from '@modules/orders/orders.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { GuestCheckoutDto, GuestOrderConfirmationQueryDto } from '@modules/orders/dto/order.dto';

describe('OrdersController (guest public routes)', () => {
  let controller: OrdersController;
  const guestCheckout = jest.fn().mockResolvedValue({
    orderNumber: 'ORD-TEST-1',
    confirmationToken: 'a'.repeat(64),
    orderId: '00000000-0000-4000-8000-000000000001',
  });
  const findGuestOrderConfirmation = jest.fn().mockResolvedValue({
    orderNumber: 'ORD-TEST-1',
    status: 'confirmed',
    total: 100,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            guestCheckout,
            findGuestOrderConfirmation,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OrdersController);
  });

  beforeEach(() => {
    guestCheckout.mockClear();
    findGuestOrderConfirmation.mockClear();
  });

  it('delegates guest checkout to OrdersService with session and idempotency header', async () => {
    const dto = {
      customerEmail: 'buyer@example.com',
      billingAddress: {
        firstName: 'A',
        lastName: 'B',
        address1: '1 Main',
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
      shippingAddress: {
        firstName: 'A',
        lastName: 'B',
        address1: '1 Main',
        city: 'NYC',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
    } as GuestCheckoutDto;

    const res = await controller.guestCheckout('session-abc', 'idem-1', dto);

    expect(guestCheckout).toHaveBeenCalledWith('session-abc', dto, 'idem-1');
    expect(res.orderNumber).toBe('ORD-TEST-1');
  });

  it('delegates guest confirmation lookup to OrdersService', async () => {
    const query = {
      orderNumber: 'ORD-TEST-1',
      token: 'a'.repeat(64),
    } as GuestOrderConfirmationQueryDto;

    const res = await controller.guestConfirmation(query);

    expect(findGuestOrderConfirmation).toHaveBeenCalledWith(query);
    expect(res).toMatchObject({ orderNumber: 'ORD-TEST-1' });
  });
});
