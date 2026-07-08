import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: this file is the single source of truth for product data (the old
// duplicate array in products.service.ts and the unused mock-server/db.json
// are both gone). If you correct a color name or swap a photo here, re-run
// `npm run seed` in backend/ to push it into the database.
const BELT_COLORS = [
  { name: 'Black', nameAr: 'أسود', hex: '#1a1a1a', image: 'images/belt-1.jpg' },
  { name: 'Havana', nameAr: 'هافان', hex: '#c17a35', image: 'images/belt-2.jpg' },
  { name: 'Brown', nameAr: 'بني', hex: '#a0622a', image: 'images/belt-5.jpg' },
  { name: 'Camel', nameAr: 'جملي', hex: '#a8763f', image: 'images/belt-6.jpg' },
];
const WALLET_COLORS = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/wallet-4.jpg' },
  { name: 'Tan', nameAr: 'كستنائي', hex: '#a0622a', image: 'images/wallet-1.jpg' },
  { name: 'Cognac', nameAr: 'كونياك', hex: '#7b3f1e', image: 'images/wallet-5.jpg' },
  { name: 'Black', nameAr: 'أسود', hex: '#1a1a1a', image: 'images/wallet-6.jpg' },
];
const CARD_COLORS = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/card-1.jpg' },
  { name: 'Tan', nameAr: 'كستنائي', hex: '#a0622a', image: 'images/card-2.jpg' },
  { name: 'Black', nameAr: 'أسود', hex: '#1a1a1a', image: 'images/card-3.jpg' },
];
// Real photos of the actual women's line (the old "portfolio-1/2.jpg" files
// were men's wallet photos mislabeled as women's — fixed below using the
// real product shots from the golden bull photo folder).
const PORTEFEUILLE_COLORS = [
  { name: 'Burgundy', nameAr: 'نبيتي', hex: '#7b1e2b', image: 'images/portefeuille-1.jpg' },
  { name: 'Grey Cowhide', nameAr: 'رمادي جلد طبيعي', hex: '#9c9690', image: 'images/portefeuille-2.jpg' },
  { name: 'Tan Cowhide', nameAr: 'بيچ جلد طبيعي', hex: '#c9a876', image: 'images/portefeuille-3.jpg' },
  { name: 'Black Patchwork', nameAr: 'أسود باتش وورك', hex: '#26221f', image: 'images/portefeuille-4.jpg' },
];
const LONG_WALLET_COLORS = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/longwallet-1.jpg' },
  { name: 'Tan', nameAr: 'كستنائي', hex: '#a0622a', image: 'images/longwallet-2.jpg' },
];
// Real slipper photos (the old data pointed all three colors at the same
// belt photo, so the swatches never actually changed the picture).
const SLIPPER_COLORS = [
  { name: 'Tan', nameAr: 'كستنائي', hex: '#c8975a', image: 'images/slipper-1.jpg' },
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#5a3a22', image: 'images/slipper-2.jpg' },
  { name: 'Medium Brown', nameAr: 'بني وسط', hex: '#7a4f30', image: 'images/slipper-3.jpg' },
];

const products = [
  { nameEn: 'Classic Leather Belt', nameAr: 'حزام جلد كلاسيك', price: 350, image: 'images/belt-1.jpg', category: 'belts', inStock: true, descEn: 'A timeless classic handcrafted from genuine full-grain leather. Durable, elegant, and made to last for years.', descAr: 'حزام كلاسيكي خالد مصنوع يدوياً من جلد طبيعي عالي الجودة. متين وأنيق ومصمم ليدوم لسنوات.', colors: BELT_COLORS },
  { nameEn: 'Wide Leather Belt', nameAr: 'حزام جلد عريض', price: 420, image: 'images/belt-2.jpg', category: 'belts', inStock: true, descEn: 'A bold wide-cut belt for a statement look. Perfect for casual and semi-formal wear.', descAr: 'حزام عريض بجرأة لإطلالة مميزة. مثالي للإطلالات الكاجوال وشبه الرسمية.', colors: BELT_COLORS },
  { nameEn: 'Heritage Belt', nameAr: 'حزام هيريتاج', price: 390, image: 'images/belt-5.jpg', category: 'belts', inStock: true, descEn: 'Heritage-style belt with a classic buckle. Crafted from natural vegetable-tanned leather.', descAr: 'حزام بأسلوب هيريتاج مع إبزيم كلاسيكي. مصنوع من الجلد المدبوغ نباتياً.', colors: BELT_COLORS },
  { nameEn: 'Slim Bifold Wallet', nameAr: 'محفظة سليم بيفولد', price: 550, image: 'images/wallet-1.jpg', category: 'wallets', inStock: true, descEn: 'Slim and minimalist bifold wallet. Holds cards and cash without the bulk.', descAr: 'محفظة بيفولد رفيعة ومينيمالية. تحتوي على البطاقات والنقود بدون ضخامة.', colors: WALLET_COLORS },
  { nameEn: 'Full-Grain Wallet', nameAr: 'محفظة فل جرين', price: 650, image: 'images/wallet-2.jpg', category: 'wallets', inStock: true, descEn: 'Premium full-grain leather wallet that develops a beautiful patina over time.', descAr: 'محفظة من الجلد الطبيعي الكامل تكتسب جمالاً طبيعياً مع الوقت.', colors: WALLET_COLORS },
  { nameEn: 'Classic Bifold', nameAr: 'محفظة بيفولد كلاسيك', price: 580, image: 'images/wallet-5.jpg', category: 'wallets', inStock: true, descEn: 'The everyday classic. A clean bifold with generous card slots.', descAr: 'الكلاسيك اليومي. بيفولد نظيف مع فتحات بطاقات وافرة.', colors: WALLET_COLORS },
  { nameEn: "Men's Long Wallet", nameAr: 'محفظة طويلة رجالي', price: 720, image: 'images/longwallet-1.jpg', category: 'longWallets', inStock: true, descEn: 'Spacious long wallet with multiple compartments for cards, cash, and documents.', descAr: 'محفظة طويلة واسعة بحجرات متعددة للبطاقات والنقود والوثائق.', colors: LONG_WALLET_COLORS },
  { nameEn: "Men's Zip Long Wallet", nameAr: 'محفظة طويلة زيب رجالي', price: 780, image: 'images/longwallet-2.jpg', category: 'longWallets', inStock: true, descEn: 'Premium zip-around long wallet with secure closure and multiple pockets.', descAr: 'محفظة طويلة زيب فاخرة مع إغلاق آمن وجيوب متعددة.', colors: LONG_WALLET_COLORS },
  { nameEn: "Portefeuille — Women's", nameAr: 'بورتفيه نسائي', price: 680, image: 'images/portefeuille-1.jpg', category: 'portefeuille', inStock: true, descEn: "Elegant women's long leather wallet in burgundy full-grain leather.", descAr: 'بورتفيه جلد نسائي أنيق باللون النبيتي من الجلد الطبيعي الكامل.', colors: PORTEFEUILLE_COLORS },
  { nameEn: 'Portefeuille Slim', nameAr: 'بورتفيه سليم نسائي', price: 620, image: 'images/portefeuille-3.jpg', category: 'portefeuille', inStock: true, descEn: 'Slim portefeuille in tan cowhide-pattern leather. Perfect everyday companion.', descAr: 'بورتفيه رفيع بلمسة جلد طبيعي بخامة الكاوهايد الكستنائي. رفيق مثالي لكل يوم.', colors: PORTEFEUILLE_COLORS },
  { nameEn: 'Minimalist Card Holder', nameAr: 'كارت هولدر مينيمال', price: 280, image: 'images/card-1.jpg', category: 'cardHolders', inStock: true, descEn: 'Ultra-slim card holder for the modern minimalist. Fits 4–6 cards comfortably.', descAr: 'كارت هولدر نحيف للغاية للشخصية العصرية المينيمالية. يحمل 4-6 بطاقات.', colors: CARD_COLORS },
  { nameEn: 'Snap Card Holder', nameAr: 'كارت هولدر سناب', price: 320, image: 'images/card-2.jpg', category: 'cardHolders', inStock: true, descEn: 'Secure snap-closure card holder with easy card access.', descAr: 'كارت هولدر بقفل سناب آمن مع سهولة الوصول للبطاقات.', colors: CARD_COLORS },
  { nameEn: 'Leather Slipper — Classic', nameAr: 'شبشب جلد كلاسيك', price: 800, image: 'images/slipper-1.jpg', category: 'slippers', inStock: true, descEn: 'Handcrafted classic leather slippers for ultimate comfort.', descAr: 'شبشب جلد كلاسيك مصنوع يدوياً لراحة قصوى.', colors: SLIPPER_COLORS },
  { nameEn: 'Leather Slipper — Classic', nameAr: 'شبشب جلد كلاسيك', price: 800, image: 'images/slipper-1.jpg', category: 'slippers', inStock: true, descEn: 'Handcrafted classic leather slippers for ultimate comfort.', descAr: 'شبشب جلد كلاسيك مصنوع يدوياً لراحة قصوى.', colors: SLIPPER_COLORS },
];

async function main() {
  console.log('Seeding...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  for (const p of products) {
    await prisma.product.create({ data: { ...p, colors: JSON.stringify(p.colors) } });
  }

  await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('123456', 10),
      role: 'customer',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@leatherhoard.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
    },
  });

  console.log(`Seeded ${products.length} products and 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
