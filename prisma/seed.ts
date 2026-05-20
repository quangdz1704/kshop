import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Tạo admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kshop.com' },
    update: {},
    create: {
      email: 'admin@kshop.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin.email);

  // Tạo test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@kshop.com' },
    update: {},
    create: {
      email: 'user@kshop.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Test user created:', user.email);

  // Tạo sản phẩm mẫu
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Điện thoại iPhone 15 Pro Max 256GB chính hãng Apple',
      price: 29990000,
      stock: 50,
      category: 'Điện thoại',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Điện thoại Samsung Galaxy S24 Ultra 512GB',
      price: 27990000,
      stock: 30,
      category: 'Điện thoại',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
    },
    {
      name: 'MacBook Pro M3',
      description: 'Laptop MacBook Pro 14 inch M3 chip 512GB',
      price: 49990000,
      stock: 20,
      category: 'Laptop',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
    },
    {
      name: 'AirPods Pro 2',
      description: 'Tai nghe AirPods Pro 2 chống ồn chủ động',
      price: 5990000,
      stock: 100,
      category: 'Phụ kiện',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
    },
    {
      name: 'iPad Air M2',
      description: 'Máy tính bảng iPad Air 11 inch M2 chip 256GB',
      price: 19990000,
      stock: 40,
      category: 'Tablet',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Đồng hồ thông minh Apple Watch Series 9 GPS 45mm',
      price: 10990000,
      stock: 60,
      category: 'Đồng hồ',
      image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500',
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Tai nghe chống ồn Sony WH-1000XM5',
      price: 8990000,
      stock: 35,
      category: 'Phụ kiện',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    },
    {
      name: 'Dell XPS 15',
      description: 'Laptop Dell XPS 15 OLED Intel Core i7 32GB RAM',
      price: 45990000,
      stock: 15,
      category: 'Laptop',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    
    if (!existing) {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log('Sample products created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

