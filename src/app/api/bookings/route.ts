import { NextRequest, NextResponse } from 'next/server';
import { Booking, ServiceType, BookingStatus } from '@/types/booking';
import { GROOMING_STAGES, WEIGHT_RANGES } from '@/lib/constants';
import { getBookingById as getFeishuBooking, createBookingInFeishu, updateBookingStatus as updateFeishuBooking } from '@/lib/feishu';

const MEMORY_STORAGE_KEY = 'jingangchong_memory_bookings';

let memoryBookings: Booking[] = [];

function loadMemoryBookings(): Booking[] {
  if (typeof localStorage !== 'undefined') {
    try {
      const data = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (data) {
        memoryBookings = JSON.parse(data);
      }
    } catch {
      memoryBookings = [];
    }
  }
  return memoryBookings;
}

function saveMemoryBookings(bookings: Booking[]): void {
  memoryBookings = bookings;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(bookings));
  }
}

function getBookings(): Booking[] {
  if (memoryBookings.length === 0) {
    loadMemoryBookings();
  }
  return memoryBookings;
}

function getBookingById(id: string): Booking | undefined {
  return getBookings().find(b => b.id === id);
}

function createBooking(data: {
  ownerName: string;
  phone: string;
  petName: string;
  serviceType: ServiceType;
  weightRange: string;
  bookingDate: string;
  bookingTime: string;
  vaccineDate: string;
  outsideGroomed: string;
  emotionStable: string;
  notes?: string;
}): Booking {
  const bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const weightRangeObj = WEIGHT_RANGES.find(w => w.label === data.weightRange) || WEIGHT_RANGES[0];
  
  const booking: Booking = {
    id: bookingId,
    ownerName: data.ownerName,
    phone: data.phone,
    petName: data.petName,
    serviceType: data.serviceType,
    weightRange: weightRangeObj,
    bookingDateTime: `${data.bookingDate} ${data.bookingTime}`,
    vaccineDate: data.vaccineDate,
    outsideGroomed: data.outsideGroomed === 'Yes',
    emotionStable: data.emotionStable === 'Yes',
    notes: data.notes,
    status: BookingStatus.PENDING,
    currentPhase: '等待审核',
    currentStep: 0,
    wechatNoticeSent: false,
    displayInServiceList: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const bookings = getBookings();
  bookings.push(booking);
  saveMemoryBookings(bookings);
  
  return booking;
}

function updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  
  if (index === -1) return undefined;
  
  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveMemoryBookings(bookings);
  return bookings[index];
}

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
    const localBooking = getBookingById(id);
    if (localBooking) {
      return NextResponse.json(localBooking);
    }
    
    try {
      const feishuBooking = await getFeishuBooking(id);
      if (feishuBooking) {
        return NextResponse.json(mapFeishuToBooking(feishuBooking));
      }
    } catch (error) {
      console.warn('Failed to fetch from Feishu:', error);
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
    console.error('Create booking error:', error);
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
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    );
  }
}