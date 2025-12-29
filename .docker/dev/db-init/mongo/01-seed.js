// VaultDB Community - MongoDB Test Data (10,000 documents)
// This script creates collections and populates them with test data

// Switch to testdb
db = db.getSiblingDB('testdb');

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(startDays, endDays) {
    const now = new Date();
    const days = randomInt(startDays, endDays);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Data arrays
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const categoryNames = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Health', 'Beauty', 'Automotive', 'Food', 'Jewelry', 'Music', 'Office', 'Pet Supplies', 'Baby', 'Tools', 'Outdoor', 'Art', 'Furniture', 'Kitchen'];
const productPrefixes = ['Laptop Pro', 'Smartphone X', 'T-Shirt Classic', 'Novel Book', 'Garden Tool', 'Running Shoes', 'Action Figure', 'Vitamin Pack', 'Face Cream', 'Car Battery', 'Organic Coffee', 'Gold Ring', 'Guitar Strings', 'Desk Lamp', 'Dog Food', 'Baby Monitor', 'Power Drill', 'Camping Tent', 'Paint Brush Set', 'Office Chair'];
const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln', 'Maple Dr', 'Broadway', 'Park Ave'];
const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
const userStatuses = ['active', 'inactive', 'pending'];
const logLevels = ['debug', 'info', 'warn', 'error'];

print('=== Starting MongoDB Test Data Generation ===');

// Drop existing collections
db.categories.drop();
db.users.drop();
db.products.drop();
db.orders.drop();
db.logs.drop();

// Create Categories (20 documents)
print('Creating categories...');
const categories = categoryNames.map((name, index) => ({
    name: name,
    slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
    description: `${name} products and accessories`,
    isActive: true,
    order: index + 1,
    createdAt: randomDate(365, 730),
    updatedAt: new Date()
}));
db.categories.insertMany(categories);
print(`Categories: ${db.categories.countDocuments()}`);

// Create Users (2,000 documents)
print('Creating users...');
const users = [];
for (let i = 1; i <= 2000; i++) {
    users.push({
        username: `user_${i}`,
        email: `user${i}@example.com`,
        fullName: `User ${i} ${randomElement(lastNames)}`,
        passwordHash: `$2b$10$${Math.random().toString(36).substring(2)}`,
        status: randomElement(userStatuses),
        profile: {
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
            bio: `I am user number ${i}. I love shopping online!`,
            phone: `+1-555-${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`
        },
        preferences: {
            newsletter: Math.random() > 0.5,
            notifications: Math.random() > 0.3,
            language: randomElement(['en', 'es', 'pt', 'fr'])
        },
        lastLoginAt: randomDate(0, 30),
        createdAt: randomDate(30, 365),
        updatedAt: new Date()
    });

    if (i % 500 === 0) {
        db.users.insertMany(users);
        users.length = 0;
        print(`  Users progress: ${i}/2000`);
    }
}
if (users.length > 0) db.users.insertMany(users);
print(`Users: ${db.users.countDocuments()}`);

// Create Products (3,000 documents)
print('Creating products...');
const products = [];
for (let i = 1; i <= 3000; i++) {
    const prefix = productPrefixes[i % productPrefixes.length];
    const category = categoryNames[i % categoryNames.length];

    products.push({
        name: `${prefix} ${i}`,
        slug: `${prefix.toLowerCase().replace(/ /g, '-')}-${i}`,
        description: `High-quality ${prefix} #${i} with excellent features and durability. Perfect for everyday use.`,
        price: randomFloat(10, 500),
        compareAtPrice: Math.random() > 0.7 ? randomFloat(500, 800) : null,
        stockQuantity: randomInt(0, 1000),
        sku: `SKU-${String(i).padStart(6, '0')}`,
        category: category,
        tags: [category.toLowerCase(), 'new', Math.random() > 0.5 ? 'sale' : 'featured'],
        images: [
            { url: `https://picsum.photos/seed/${i}/400/400`, alt: `${prefix} ${i}` },
            { url: `https://picsum.photos/seed/${i + 1}/400/400`, alt: `${prefix} ${i} - View 2` }
        ],
        specifications: {
            weight: `${randomFloat(0.1, 10)} kg`,
            dimensions: `${randomInt(5, 50)} x ${randomInt(5, 50)} x ${randomInt(5, 30)} cm`,
            material: randomElement(['Plastic', 'Metal', 'Wood', 'Fabric', 'Glass', 'Leather'])
        },
        isActive: i % 10 !== 0,
        rating: {
            average: randomFloat(3.0, 5.0, 1),
            count: randomInt(0, 500)
        },
        createdAt: randomDate(30, 730),
        updatedAt: new Date()
    });

    if (i % 500 === 0) {
        db.products.insertMany(products);
        products.length = 0;
        print(`  Products progress: ${i}/3000`);
    }
}
if (products.length > 0) db.products.insertMany(products);
print(`Products: ${db.products.countDocuments()}`);

// Create Orders (3,000 documents)
print('Creating orders...');
const orders = [];
for (let i = 1; i <= 3000; i++) {
    const itemCount = randomInt(1, 5);
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
        const quantity = randomInt(1, 3);
        const unitPrice = randomFloat(10, 200);
        const totalPrice = quantity * unitPrice;
        subtotal += totalPrice;

        items.push({
            productId: randomInt(1, 3000),
            productName: `${randomElement(productPrefixes)} ${randomInt(1, 3000)}`,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: parseFloat(totalPrice.toFixed(2))
        });
    }

    const shipping = randomFloat(5, 25);
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    orders.push({
        orderNumber: `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i).padStart(5, '0')}`,
        userId: randomInt(1, 2000),
        status: randomElement(orderStatuses),
        items: items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: shipping,
        tax: tax,
        total: total,
        shippingAddress: {
            street: `${randomInt(100, 9999)} ${randomElement(streets)}`,
            city: randomElement(cities).split(',')[0],
            state: randomElement(cities).split(',')[1]?.trim() || 'NY',
            zipCode: String(randomInt(10000, 99999)),
            country: 'USA'
        },
        billingAddress: {
            sameAsShipping: Math.random() > 0.3
        },
        paymentMethod: randomElement(['credit_card', 'paypal', 'bank_transfer', 'pix']),
        notes: i % 3 === 0 ? 'Rush delivery requested' : null,
        trackingNumber: i % 4 === 0 ? `TRK${String(randomInt(100000000, 999999999))}` : null,
        createdAt: randomDate(0, 365),
        updatedAt: new Date()
    });

    if (i % 500 === 0) {
        db.orders.insertMany(orders);
        orders.length = 0;
        print(`  Orders progress: ${i}/3000`);
    }
}
if (orders.length > 0) db.orders.insertMany(orders);
print(`Orders: ${db.orders.countDocuments()}`);

// Create Logs (2,000 documents)
print('Creating logs...');
const logs = [];
for (let i = 1; i <= 2000; i++) {
    logs.push({
        level: randomElement(logLevels),
        message: `Log entry #${i}: ${randomElement(['User action', 'System event', 'API call', 'Database query', 'Cache operation'])} completed`,
        context: {
            module: randomElement(['auth', 'orders', 'products', 'users', 'payments']),
            action: randomElement(['create', 'read', 'update', 'delete']),
            duration: randomInt(1, 5000),
            requestId: `req_${Math.random().toString(36).substring(2, 15)}`
        },
        userId: Math.random() > 0.5 ? randomInt(1, 2000) : null,
        ipAddress: `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`,
        userAgent: randomElement([
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        ]),
        createdAt: randomDate(0, 30)
    });

    if (i % 500 === 0) {
        db.logs.insertMany(logs);
        logs.length = 0;
        print(`  Logs progress: ${i}/2000`);
    }
}
if (logs.length > 0) db.logs.insertMany(logs);
print(`Logs: ${db.logs.countDocuments()}`);

// Create indexes
print('Creating indexes...');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });

db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ isActive: 1 });
db.products.createIndex({ 'rating.average': -1 });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.logs.createIndex({ level: 1 });
db.logs.createIndex({ createdAt: -1 });
db.logs.createIndex({ 'context.module': 1 });

// Print summary
print('\n=== MongoDB Test Data Summary ===');
print(`Categories: ${db.categories.countDocuments()}`);
print(`Users: ${db.users.countDocuments()}`);
print(`Products: ${db.products.countDocuments()}`);
print(`Orders: ${db.orders.countDocuments()}`);
print(`Logs: ${db.logs.countDocuments()}`);
const total = db.categories.countDocuments() + db.users.countDocuments() + db.products.countDocuments() + db.orders.countDocuments() + db.logs.countDocuments();
print(`TOTAL: ${total} documents`);
print('=================================');
