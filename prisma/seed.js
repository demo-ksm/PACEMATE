import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Pacemate database seeding with payment support...');

  // Clean existing database records safely respecting foreign keys
  await prisma.notificationLog.deleteMany({});
  await prisma.waitlist.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.clubMember.deleteMany({});

  // Clear relations on users & clubs before deleting
  await prisma.user.updateMany({ data: { clubId: null } });
  await prisma.club.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Organizers
  const organizer1 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      phone: '+1 (555) 234-5678',
      email: 'elena@sunrisestrides.com',
      role: 'ORGANIZER',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      phone: '+1 (555) 876-5432',
      email: 'marcus@midnightrunners.org',
      role: 'ORGANIZER',
    },
  });

  // 2. Create Clubs
  const club1 = await prisma.club.create({
    data: {
      name: 'Sunrise Strides NYC',
      city: 'New York, NY',
      description: 'Morning social run club exploring Central Park and waterfront loops. Coffee after every run!',
      ownerUserId: organizer1.id,
    },
  });

  const club2 = await prisma.club.create({
    data: {
      name: 'Midnight Runners SF',
      city: 'San Francisco, CA',
      description: 'Dusk tempo runs, hill sprints, and post-run craft brew community for Bay Area runners.',
      ownerUserId: organizer2.id,
    },
  });

  await prisma.user.update({
    where: { id: organizer1.id },
    data: { clubId: club1.id },
  });

  await prisma.user.update({
    where: { id: organizer2.id },
    data: { clubId: club2.id },
  });

  // 3. Create Runners
  const runnersData = [
    { name: 'Alex Rivera', phone: '+1 (555) 301-4412', email: 'alex.rivera@example.com' },
    { name: 'Sarah Chen', phone: '+1 (555) 402-5523', email: 'sarah.chen@example.com' },
    { name: 'Jordan Blake', phone: '+1 (555) 503-6634', email: 'jordan.b@example.com' },
    { name: 'Carlos Mendez', phone: '+1 (555) 604-7745', email: 'carlos.m@example.com' },
    { name: 'Maya Patel', phone: '+1 (555) 705-8856', email: 'maya.patel@example.com' },
    { name: 'David Kim', phone: '+1 (555) 806-9967', email: 'david.kim@example.com' },
  ];

  const createdRunners = [];
  for (const r of runnersData) {
    const runner = await prisma.user.create({
      data: {
        name: r.name,
        phone: r.phone,
        email: r.email,
        role: 'RUNNER',
      },
    });
    createdRunners.push(runner);

    await prisma.clubMember.create({
      data: {
        clubId: club1.id,
        userId: runner.id,
      },
    });
  }

  await prisma.clubMember.create({
    data: { clubId: club2.id, userId: createdRunners[0].id },
  });
  await prisma.clubMember.create({
    data: { clubId: club2.id, userId: createdRunners[1].id },
  });

  const today = new Date();
  const getOffsetDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const nextSaturday = getOffsetDate(3);
  const nextTuesday = getOffsetDate(6);
  const nextThursday = getOffsetDate(8);
  const lastWeek = getOffsetDate(-7);

  // 4. Create Events (Free & Paid)
  const event1 = await prisma.event.create({
    data: {
      clubId: club1.id,
      name: 'Central Park 5K Sunrise Loop & Coffee',
      description: 'Kick off your Saturday with a light 5K loop around the reservoir. All paces welcome!',
      date: nextSaturday,
      time: '07:30 AM',
      location: 'Engineers Gate (90th St & 5th Ave), New York',
      capacity: 10,
      price: 0, // Free event
      paceGroups: '4:30 min/km, 5:00 min/km, 5:30 min/km, 6:00 min/km, Party Pace (6:30+)',
      coverImageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
      checkInCode: '582914',
      createdBy: organizer1.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      clubId: club1.id,
      name: 'Waterfront 8K & Craft Brew Social',
      description: 'Exclusive 8K high-intensity speed session followed by post-run craft brew & snacks (cover charge applies).',
      date: nextTuesday,
      time: '06:30 PM',
      location: 'East River Track (6th St & FDR Drive), New York',
      capacity: 3,
      price: 350, // Paid event ₹350
      paceGroups: '4:15 min/km, 4:45 min/km, 5:15 min/km',
      coverImageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
      checkInCode: '910342',
      createdBy: organizer1.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      clubId: club2.id,
      name: 'Golden Gate Bridge Sunset 10K',
      description: 'Scenic 10K out-and-back across Golden Gate Bridge down to Fort Point.',
      date: nextThursday,
      time: '06:15 PM',
      location: 'Crissy Field Center, San Francisco',
      capacity: 12,
      price: 0, // Free event
      paceGroups: '5:00 min/km, 5:30 min/km, 6:00 min/km, Party Pace (6:30+)',
      coverImageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
      checkInCode: '372819',
      createdBy: organizer2.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      clubId: club1.id,
      name: 'Brooklyn Bridge Dusk Intervals',
      description: 'Classic dusk interval run across the bridge into DUMBO.',
      date: lastWeek,
      time: '07:00 PM',
      location: 'City Hall Park, New York',
      capacity: 10,
      price: 200, // Paid event ₹200
      paceGroups: '5:00 min/km, 5:30 min/km, 6:00 min/km',
      coverImageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
      checkInCode: '104829',
      createdBy: organizer1.id,
    },
  });

  // 5. Create Registrations with payment status
  await prisma.registration.create({
    data: { eventId: event1.id, userId: createdRunners[0].id, paceGroup: '5:00 min/km', paymentStatus: 'NOT_REQUIRED' },
  });
  await prisma.registration.create({
    data: { eventId: event1.id, userId: createdRunners[1].id, paceGroup: '5:30 min/km', paymentStatus: 'NOT_REQUIRED' },
  });

  // Paid Event (Event 2) -> One runner Paid Now ("PAID"), One runner Pay Later ("PENDING")
  await prisma.registration.create({
    data: { eventId: event2.id, userId: createdRunners[0].id, paceGroup: '4:15 min/km', paymentStatus: 'PAID' },
  });
  await prisma.registration.create({
    data: { eventId: event2.id, userId: createdRunners[1].id, paceGroup: '4:45 min/km', paymentStatus: 'PENDING' },
  });

  await prisma.waitlist.create({
    data: { eventId: event2.id, userId: createdRunners[2].id, paceGroup: '5:15 min/km' },
  });

  await prisma.registration.create({
    data: { eventId: event4.id, userId: createdRunners[0].id, paceGroup: '5:00 min/km', attended: true, paymentStatus: 'PAID' },
  });
  await prisma.registration.create({
    data: { eventId: event4.id, userId: createdRunners[1].id, paceGroup: '5:30 min/km', attended: true, paymentStatus: 'PAID' },
  });
  await prisma.registration.create({
    data: { eventId: event4.id, userId: createdRunners[2].id, paceGroup: '6:00 min/km', attended: false, paymentStatus: 'PENDING' },
  });

  console.log('✅ Database seeded with free & paid event data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
