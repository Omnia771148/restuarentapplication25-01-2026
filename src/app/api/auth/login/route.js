import { MongoClient } from 'mongodb';

// Use your exact environment variable name
const MONGODB_URI = process.env.MongoURL;

export async function POST(request) {
  let client;

  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using your MongoURL
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    // Get the database from the connection
    const db = client.db();
    const collection = db.collection('restuarentusers');

    // Find user by email and password
    const user = await collection.findOne({
      email: email,
      password: password
    });

    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return the data from your database
    return Response.json({
      success: true,
      user: {
        restId: user.restId,
        restLocation: user.restLocation,
        restaurantLocation: user.restaurantLocation,
        email: user.email,
        phone: user.phone,
        _id: user._id
      }
    });

  } catch (error) {
    console.error('MongoDB login error:', error);
    return Response.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}