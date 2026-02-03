import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/root' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }
    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Hello World" }))
    }

    // Status endpoints - POST /api/status
    if (route === '/status' && method === 'POST') {
      const body = await request.json()

      if (!body.client_name) {
        return handleCORS(NextResponse.json(
          { error: "client_name is required" },
          { status: 400 }
        ))
      }

      const statusObj = {
        id: uuidv4(),
        client_name: body.client_name,
        timestamp: new Date()
      }

      await db.collection('status_checks').insertOne(statusObj)
      return handleCORS(NextResponse.json(statusObj))
    }

    // Status endpoints - GET /api/status
    if (route === '/status' && method === 'GET') {
      const statusChecks = await db.collection('status_checks')
        .find({})
        .limit(1000)
        .toArray()

      // Remove MongoDB's _id field from response
      const cleanedStatusChecks = statusChecks.map(({ _id, ...rest }) => rest)

      return handleCORS(NextResponse.json(cleanedStatusChecks))
    }

    // Fees endpoints
    if (route.startsWith('/fees') || route.startsWith('/principal/fees') || route.startsWith('/student/fees')) {
      // POST /api/fees/structure - Create fee structure
      if (route === '/fees/structure' && method === 'POST') {
        const body = await request.json()
        const feeStructure = {
          id: uuidv4(),
          ...body,
          createdAt: new Date(),
        }
        await db.collection('fee_structures').insertOne(feeStructure)
        return handleCORS(NextResponse.json({ success: true, data: feeStructure }))
      }

      // GET /api/fees/structure - Get fee structures
      if (route === '/fees/structure' && method === 'GET') {
        const structures = await db.collection('fee_structures').find({}).toArray()
        const cleaned = structures.map(({ _id, ...rest }) => rest)
        return handleCORS(NextResponse.json({ success: true, data: cleaned }))
      }

      // GET /api/fees/defaulters
      if (route === '/fees/defaulters' && method === 'GET') {
        const defaulters = await db.collection('fees_defaulters').find({}).toArray()
        const cleaned = defaulters.map(({ _id, ...rest }) => rest)
        return handleCORS(NextResponse.json({ success: true, data: cleaned }))
      }

      // GET /api/fees/statistics
      if (route === '/fees/statistics' && method === 'GET') {
        const stats = await db.collection('fees_statistics').findOne({})
        return handleCORS(NextResponse.json({ success: true, data: stats || {} }))
      }

      // Principal fees endpoints
      if (route.startsWith('/principal/fees')) {
        // GET /api/principal/fees/structure/:id
        const structureIdMatch = route.match(/\/principal\/fees\/structure\/(.+)$/)
        if (structureIdMatch && method === 'GET') {
          const structure = await db.collection('fee_structures').findOne({ id: structureIdMatch[1] })
          if (!structure) {
            return handleCORS(NextResponse.json({ success: false, message: 'Structure not found' }, { status: 404 }))
          }
          const { _id, ...rest } = structure
          return handleCORS(NextResponse.json({ success: true, data: rest }))
        }

        // PATCH /api/principal/fees/structure/:id/status
        const statusMatch = route.match(/\/principal\/fees\/structure\/(.+)\/status$/)
        if (statusMatch && method === 'PATCH') {
          const body = await request.json()
          const result = await db.collection('fee_structures').updateOne(
            { id: statusMatch[1] },
            { $set: { status: body.status, updatedAt: new Date() } }
          )
          return handleCORS(NextResponse.json({ success: !!result.modifiedCount }))
        }

        // POST /api/principal/fees/initialize
        if (route === '/principal/fees/initialize' && method === 'POST') {
          const body = await request.json()
          const initialization = {
            id: uuidv4(),
            ...body,
            createdAt: new Date(),
          }
          await db.collection('fees_initializations').insertOne(initialization)
          return handleCORS(NextResponse.json({ success: true, data: initialization }))
        }

        // GET /api/principal/fees/initialize/preview/:id
        const previewMatch = route.match(/\/principal\/fees\/initialize\/preview\/(.+)$/)
        if (previewMatch && method === 'GET') {
          const preview = await db.collection('fees_initializations').findOne({ structureId: previewMatch[1] })
          return handleCORS(NextResponse.json({ success: true, data: preview || {} }))
        }

        // POST /api/principal/fees/collect/:studentId
        const collectMatch = route.match(/\/principal\/fees\/collect\/(.+)$/)
        if (collectMatch && method === 'POST') {
          const body = await request.json()
          const payment = {
            id: uuidv4(),
            studentId: collectMatch[1],
            ...body,
            createdAt: new Date(),
          }
          await db.collection('fees_payments').insertOne(payment)
          return handleCORS(NextResponse.json({ success: true, data: payment }))
        }

        // GET /api/principal/fees/search-students
        if (route === '/principal/fees/search-students' && method === 'GET') {
          const searchParam = new URL(request.url).searchParams.get('search')
          const students = await db.collection('students')
            .find({ name: { $regex: searchParam || '', $options: 'i' } })
            .limit(20)
            .toArray()
          const cleaned = students.map(({ _id, ...rest }) => rest)
          return handleCORS(NextResponse.json({ success: true, data: cleaned }))
        }

        // GET /api/principal/fees/student/:studentId
        const studentMatch = route.match(/\/principal\/fees\/student\/(.+)$/)
        if (studentMatch && method === 'GET') {
          const fees = await db.collection('student_fees').findOne({ studentId: studentMatch[1] })
          return handleCORS(NextResponse.json({ success: true, data: fees || {} }))
        }

        // GET /api/principal/fees/payment-history/:studentId
        const historyMatch = route.match(/\/principal\/fees\/payment-history\/(.+)$/)
        if (historyMatch && method === 'GET') {
          const history = await db.collection('fees_payments')
            .find({ studentId: historyMatch[1] })
            .toArray()
          const cleaned = history.map(({ _id, ...rest }) => rest)
          return handleCORS(NextResponse.json({ success: true, data: cleaned }))
        }

        // POST /api/principal/fees/reminders
        if (route === '/principal/fees/reminders' && method === 'POST') {
          const body = await request.json()
          const reminder = {
            id: uuidv4(),
            ...body,
            createdAt: new Date(),
          }
          await db.collection('fees_reminders').insertOne(reminder)
          return handleCORS(NextResponse.json({ success: true, data: reminder }))
        }
      }

      // Student fees endpoints
      if (route === '/student/fees' && method === 'GET') {
        // Get current user from context (you'll need to implement auth)
        const fees = await db.collection('student_fees').findOne({})
        return handleCORS(NextResponse.json({ success: true, data: fees || {} }))
      }

      if (route === '/student/fees/payment-history' && method === 'GET') {
        const history = await db.collection('fees_payments').find({}).toArray()
        const cleaned = history.map(({ _id, ...rest }) => rest)
        return handleCORS(NextResponse.json({ success: true, data: cleaned }))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { success: false, message: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute