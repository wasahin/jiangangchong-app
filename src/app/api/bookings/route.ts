import { NextRequest, NextResponse } from 'next/server';
import { Booking, ServiceType, BookingStatus } from '@/types/booking';
import { getBookings, createBooking, updateBooking, getBookingById as getLocalBooking } from '@/lib/storage';
import { getBookingById as getFeishuBooking, createBookingInFeishu, updateBookingStatus as updateFeishuBooking } from '@/lib/feishu';
import { GROOMING_STAGES } from '@/lib/constants';

function parseFeishuText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(item => item.text || '').join('');
  }
  return String(value);
}

function mapFeishuToBooking(record: any): Booking {
  const serviceType = parseFeishuText(record.fields.service_type) || 'standard';
  const steps = GROOMING_STAGES[serviceType as ServiceType];
  
  return {
    id: parseFeishuText(record.fields.booking_id) || '',
    ownerName: parseFeishuText(record.fields.owner_name) || '',
    phone: parseFeishuText(record.fields.phone) || '',
    petName: parseFeishuText(record.fields.pet_name) || '',
    serviceType: serviceType as ServiceType,
    weightRange: { label: '未知', min: 0, max: 0 },
    bookingDateTime: '',
    vaccineDate: '',
    outsideGroomed: false,
    emotionStable: true,
    notes: '',
    status: (parseFeishuText(record.fields.status) || '待审核') as BookingStatus,
    currentPhase: '',
    currentStep: parseInt(parseFeishuText(record.fields.current_step) || '0'),
    wechatNoticeSent: false,
    displayInServiceList: false,
    createdAt: record.fields.created_at ? new Date(record.fields.created_at).toISOString() : new Date().toISOString(),
    updatedAt: record.fields.updated_at ? new Date(record.fields.updated_at).toISOString() : new Date().toISOString(),
    serviceStartedAt: '',
    isPaused: false
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (id) {
    const localBooking = getLocalBooking(id);
    if (localBooking) {
      return NextResponse.json(localBooking);
    }
    
    const feishuBooking = await getFeishuBooking(id);
    if (feishuBooking) {
      return NextResponse.json(mapFeishuToBooking(feishuBooking));
    }
    
    return NextResponse.json({ error: '预约不存在' }, { status: 404 });
  }
  
  const bookings = getBookings();
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ownerName || !body.petName) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }
    
    const booking = createBooking({
      ownerName: body.ownerName,
      phone: body.phone,
      petName: body.petName,
      serviceType: body.serviceType as ServiceType,
      weightRange: body.weightRange,
      bookingDate: body.bookingDate,
      bookingTime: body.bookingTime,
      vaccineDate: body.vaccineDate,
      outsideGroomed: body.outsideGroomed,
      emotionStable: body.emotionStable,
      notes: body.notes
    });
    
    try {
      await createBookingInFeishu({
        pet_name: body.petName,
        owner_name: body.ownerName,
        phone: body.phone,
        service_type: body.serviceType
      });
    } catch (err) {
      console.warn('Failed to sync to Feishu:', err);
    }
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少预约ID' },
        { status: 400 }
      );
    }
    
    const booking = updateBooking(id, updates as Partial<Booking>);
    if (!booking) {
      return NextResponse.json(
        { error: '预约不存在' },
        { status: 404 }
      );
    }
    
    try {
      await updateFeishuBooking(id, {
        status: booking.status,
        current_step: String(booking.currentStep),
        progress: Math.floor((booking.currentStep / (GROOMING_STAGES[booking.serviceType]?.length || 10)) * 100)
      });
    } catch (err) {
      console.warn('Failed to sync to Feishu:', err);
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    );
  }
}
