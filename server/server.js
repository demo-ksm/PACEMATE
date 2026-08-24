import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
import { Resend } from 'resend';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && !resendApiKey.includes('sample_key') ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'Pacemate Run Club <onboarding@resend.dev>';

async function sendNotification({ userId, recipientEmail, subject, htmlMessage, type }) {
  let status = 'SIMULATED';
  try {
    if (resend && recipientEmail) {
      const { data, error } = await resend.emails.send({
        from: SENDER_EMAIL,
        to: recipientEmail,
        subject: subject,
        html: htmlMessage,
      });
      if (!error) {
        status = 'SENT';
      } else {
        console.warn('⚠️ Resend email send notice:', error.message);
      }
    } else {
      console.log(`✉️ [NOTIF SIMULATION - ${type}] To: ${recipientEmail || 'User'} | Subject: ${subject}`);
    }
  } catch (err) {
    console.error('❌ Notification error:', err.message);
  }

  try {
    await prisma.notificationLog.create({
      data: {
        userId: userId || 'system',
        type,
        channel: 'EMAIL',
        recipient: recipientEmail || 'runner@pacemate.app',
        message: subject,
        status,
      },
    });
  } catch (e) {
    // Ignore logging error
  }
}

// -------------------------------------------------------------------
// 1. AUTH & USER ENDPOINTS
// -------------------------------------------------------------------

app.get('/api/auth/demo-users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        ownedClub: true,
        club: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, phone, email, role, clubName, clubCity, clubDescription } = req.body;

  if (!name || !phone || !role) {
    return res.status(400).json({ error: 'Name, phone, and role are required' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { phone },
    });
    if (existing) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    if (role === 'ORGANIZER') {
      if (!clubName || !clubCity) {
        return res.status(400).json({ error: 'Club name and city are required for organizers' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            phone,
            email: email || null,
            role: 'ORGANIZER',
          },
        });

        const club = await tx.club.create({
          data: {
            name: clubName,
            city: clubCity,
            description: clubDescription || 'Community run club',
            ownerUserId: user.id,
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { clubId: club.id },
        });

        return { user, club };
      });

      return res.status(201).json(result);
    } else {
      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          role: 'RUNNER',
        },
      });

      return res.status(201).json({ user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        ownedClub: true,
        club: true,
        memberships: {
          include: { club: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------------
// 2. CLUBS ENDPOINTS
// -------------------------------------------------------------------

app.get('/api/clubs', async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { members: true, events: true },
        },
      },
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id },
      include: {
        owner: true,
        members: {
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        events: {
          orderBy: { date: 'asc' },
          include: {
            _count: { select: { registrations: true, waitlists: true } },
          },
        },
      },
    });

    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------------
// 3. EVENTS ENDPOINTS
// -------------------------------------------------------------------

app.get('/api/events', async (req, res) => {
  const { clubId, filter, userId } = req.query;

  try {
    let whereClause = {};

    if (clubId) {
      whereClause.clubId = clubId;
    }

    if (filter === 'my-runs' && userId) {
      const userRegs = await prisma.registration.findMany({
        where: { userId },
        select: { eventId: true },
      });
      const userWait = await prisma.waitlist.findMany({
        where: { userId },
        select: { eventId: true },
      });
      const eventIds = [...userRegs.map((r) => r.eventId), ...userWait.map((w) => w.eventId)];
      whereClause.id = { in: eventIds };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        club: { select: { id: true, name: true, city: true } },
        registrations: {
          select: {
            id: true,
            userId: true,
            paceGroup: true,
            attended: true,
            checkedInAt: true,
            paymentStatus: true,
          },
        },
        waitlists: {
          select: { id: true, userId: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const formatted = events.map((e) => ({
      ...e,
      price: e.price || 0,
      paceGroupsList: e.paceGroups ? e.paceGroups.split(',').map((p) => p.trim()) : [],
      spotsRemaining: Math.max(0, e.capacity - e.registrations.length),
      isFull: e.registrations.length >= e.capacity,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        club: true,
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
          orderBy: { registeredAt: 'asc' },
        },
        waitlists: {
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const paceGroupsList = event.paceGroups ? event.paceGroups.split(',').map((p) => p.trim()) : [];
    const spotsRemaining = Math.max(0, event.capacity - event.registrations.length);

    res.json({
      ...event,
      price: event.price || 0,
      paceGroupsList,
      spotsRemaining,
      isFull: event.registrations.length >= event.capacity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  const { clubId, name, description, date, time, location, capacity, price, paceGroups, coverImageUrl, createdBy } = req.body;

  if (!clubId || !name || !date || !time || !location || !capacity || !createdBy) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }

  try {
    const checkInCode = Math.floor(100000 + Math.random() * 900000).toString();

    const event = await prisma.event.create({
      data: {
        clubId,
        name,
        description: description || '',
        date,
        time,
        location,
        capacity: parseInt(capacity, 10),
        price: price ? parseFloat(price) : 0,
        paceGroups: Array.isArray(paceGroups) ? paceGroups.join(', ') : paceGroups || 'Open Pace',
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
        checkInCode,
        createdBy,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { name, description, date, time, location, capacity, price, paceGroups, coverImageUrl } = req.body;

  try {
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        date,
        time,
        location,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        paceGroups: Array.isArray(paceGroups) ? paceGroups.join(', ') : paceGroups,
        coverImageUrl,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Event cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------------
// 4. REGISTRATION, PAYMENTS, WAITLIST & CHECK-IN
// -------------------------------------------------------------------

app.post('/api/events/:id/register', async (req, res) => {
  const { userId, paceGroup, paymentOption } = req.body; // paymentOption: "PAY_NOW" | "PAY_LATER"
  const eventId = req.params.id;

  if (!userId || !paceGroup) {
    return res.status(400).json({ error: 'User ID and pace group are required' });
  }

  try {
    const existingReg = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingReg) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event._count.registrations >= event.capacity) {
      return res.status(400).json({
        error: 'This event is full!',
        isFull: true,
        waitlistAvailable: true,
      });
    }

    // Determine paymentStatus
    let initialPaymentStatus = 'NOT_REQUIRED';
    if (event.price > 0) {
      initialPaymentStatus = paymentOption === 'PAY_NOW' ? 'PAID' : 'PENDING';
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        paceGroup,
        paymentStatus: initialPaymentStatus,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { name: true, date: true, time: true, location: true, price: true } },
      },
    });

    await prisma.clubMember.upsert({
      where: { clubId_userId: { clubId: event.clubId, userId } },
      update: {},
      create: { clubId: event.clubId, userId },
    });

    if (registration.user?.email) {
      const paymentInfoHtml = event.price > 0
        ? `<p><strong>Payment Status:</strong> ${initialPaymentStatus === 'PAID' ? '✅ Paid (₹' + event.price + ')' : '⏳ Payment Pending (₹' + event.price + ' at door)'}</p>`
        : '<p><strong>Event Fee:</strong> Free</p>';

      sendNotification({
        userId,
        recipientEmail: registration.user.email,
        subject: `Confirmed: ${registration.event.name}`,
        htmlMessage: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>🏃‍♂️ Registration Confirmed!</h2>
          <p>Hi ${registration.user.name},</p>
          <p>You are officially registered for <strong>${registration.event.name}</strong>!</p>
          <ul>
            <li><strong>Date:</strong> ${registration.event.date} at ${registration.event.time}</li>
            <li><strong>Location:</strong> ${registration.event.location}</li>
            <li><strong>Pace Group:</strong> ${registration.paceGroup}</li>
          </ul>
          ${paymentInfoHtml}
          <p>See you at the run!</p>
        </div>`,
        type: 'REGISTRATION_CONFIRMED',
      });
    }

    res.status(201).json(registration);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Payment Status (Organizer or Runner paying later)
app.post('/api/events/:id/payment-status', async (req, res) => {
  const { registrationId, paymentStatus } = req.body; // "PAID" | "PENDING" | "NOT_REQUIRED"

  if (!registrationId || !paymentStatus) {
    return res.status(400).json({ error: 'Registration ID and payment status are required' });
  }

  try {
    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: { paymentStatus },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/waitlist', async (req, res) => {
  const { userId, paceGroup } = req.body;
  const eventId = req.params.id;

  if (!userId || !paceGroup) {
    return res.status(400).json({ error: 'User ID and pace group are required' });
  }

  try {
    const existingWait = await prisma.waitlist.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingWait) {
      return res.status(400).json({ error: 'You are already on the waitlist for this event' });
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: { eventId, userId, paceGroup },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { name: true } },
      },
    });

    res.status(201).json(waitlistEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/cancel', async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.id;

  try {
    const existingReg = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingReg) {
      await prisma.registration.delete({
        where: { id: existingReg.id },
      });

      const nextInLine = await prisma.waitlist.findFirst({
        where: { eventId },
        orderBy: { joinedAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, name: true, date: true, time: true, location: true, price: true } },
        },
      });

      if (nextInLine) {
        await prisma.waitlist.delete({ where: { id: nextInLine.id } });

        const initialPaymentStatus = nextInLine.event.price > 0 ? 'PENDING' : 'NOT_REQUIRED';

        await prisma.registration.create({
          data: {
            eventId,
            userId: nextInLine.userId,
            paceGroup: nextInLine.paceGroup,
            paymentStatus: initialPaymentStatus,
          },
        });

        if (nextInLine.user.email) {
          sendNotification({
            userId: nextInLine.userId,
            recipientEmail: nextInLine.user.email,
            subject: `🎉 Spot Opened Up! You're IN: ${nextInLine.event.name}`,
            htmlMessage: `<div style="font-family: sans-serif; padding: 20px; border-left: 4px solid #E85D2C;">
              <h2>🎉 Great news! A spot opened up!</h2>
              <p>Hi ${nextInLine.user.name},</p>
              <p>A runner cancelled their registration for <strong>${nextInLine.event.name}</strong>, and you have been automatically moved from the waitlist into the official runner roster!</p>
              <ul>
                <li><strong>Date:</strong> ${nextInLine.event.date} at ${nextInLine.event.time}</li>
                <li><strong>Location:</strong> ${nextInLine.event.location}</li>
                <li><strong>Pace Group:</strong> ${nextInLine.paceGroup}</li>
              </ul>
              <p>We'll see you on race day!</p>
            </div>`,
            type: 'WAITLIST_PROMOTED',
          });
        }

        return res.json({
          message: 'Registration cancelled. Spot automatically awarded to next waitlisted runner!',
          promotedUser: nextInLine.user.name,
        });
      }
    } else {
      const existingWait = await prisma.waitlist.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (existingWait) {
        await prisma.waitlist.delete({ where: { id: existingWait.id } });
      }
    }

    res.json({ message: 'Registration / waitlist entry cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/checkin', async (req, res) => {
  const { userId, qrCodeValue, pinCode } = req.body;
  const eventId = req.params.id;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const expectedQrCode = `PACEMATE:EVENT:${eventId}`;
    const isValidQr = qrCodeValue && (qrCodeValue === expectedQrCode || qrCodeValue.includes(eventId));
    const isValidPin = pinCode && pinCode.trim() === event.checkInCode;

    if (!isValidQr && !isValidPin) {
      return res.status(400).json({ error: 'Invalid QR code or backup PIN.' });
    }

    const registration = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!registration) {
      return res.status(400).json({ error: 'You are not registered for this event.' });
    }

    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        attended: true,
        checkedInAt: new Date(),
      },
    });

    res.json({
      message: 'CHECKED IN SUCCESSFULLY! 🎉',
      registration: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/attendance', async (req, res) => {
  const { registrationId, attended } = req.body;

  try {
    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        attended: Boolean(attended),
        checkedInAt: attended ? new Date() : null,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------------
// 5. MEMBER DIRECTORY & ORGANIZER DASHBOARD STATS
// -------------------------------------------------------------------

app.get('/api/clubs/:id/roster', async (req, res) => {
  const clubId = req.params.id;

  try {
    const clubEvents = await prisma.event.findMany({
      where: { clubId },
      select: { id: true },
    });
    const eventIds = clubEvents.map((e) => e.id);

    const members = await prisma.clubMember.findMany({
      where: { clubId },
      include: {
        user: {
          include: {
            registrations: {
              where: { eventId: { in: eventIds } },
            },
          },
        },
      },
    });

    const roster = members.map((m) => {
      const regs = m.user.registrations;
      const totalRegistered = regs.length;
      const totalAttended = regs.filter((r) => r.attended).length;
      const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

      return {
        id: m.user.id,
        name: m.user.name,
        phone: m.user.phone,
        email: m.user.email,
        firstJoined: m.joinedAt,
        totalRegistered,
        totalAttended,
        attendanceRate,
      };
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clubs/:id/stats', async (req, res) => {
  const clubId = req.params.id;

  try {
    const today = new Date().toISOString().split('T')[0];

    const totalMembers = await prisma.clubMember.count({
      where: { clubId },
    });

    const upcomingEvents = await prisma.event.findMany({
      where: {
        clubId,
        date: { gte: today },
      },
      include: {
        _count: { select: { registrations: true, waitlists: true } },
      },
      orderBy: { date: 'asc' },
    });

    const pastEvents = await prisma.event.findMany({
      where: {
        clubId,
        date: { lt: today },
      },
      include: {
        registrations: true,
      },
    });

    let totalPastRegs = 0;
    let totalPastAttended = 0;

    pastEvents.forEach((ev) => {
      totalPastRegs += ev.registrations.length;
      totalPastAttended += ev.registrations.filter((r) => r.attended).length;
    });

    const avgAttendanceRate = totalPastRegs > 0 ? Math.round((totalPastAttended / totalPastRegs) * 100) : 100;

    res.json({
      totalMembers,
      upcomingEventsCount: upcomingEvents.length,
      avgAttendanceRate,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Pacemate API server running on http://localhost:${PORT}`);
});
