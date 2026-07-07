import { Injectable } from '@angular/core';

export interface ColorOption {
  name: string;
  nameAr: string;
  hex: string;
  image?: string; // color-specific product image
}

export interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  category: 'belts' | 'wallets' | 'cardHolders' | 'slippers' | 'portefeuille' | 'longWallets';
  inStock: boolean;
  descEn: string;
  descAr: string;
  colors: ColorOption[];
}

/* Belt colors with color-mapped images */
const BELT_COLORS: ColorOption[] = [
  { name: 'Navy',      nameAr: 'كحلي',  hex: '#1a2744', image: 'images/belt-6.jpg'  },
  { name: 'Black',     nameAr: 'أسود',  hex: '#1a1a1a', image: 'images/belt-1.jpg'  },
  { name: 'Brown',     nameAr: 'بني',   hex: '#3b1f0e', image: 'images/belt-5.jpg'  },
  { name: 'Havana',    nameAr: 'هافان', hex: '#8b4010', image: 'images/belt-2.jpg'  },
];

const WALLET_COLORS: ColorOption[] = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/wallet-4.jpg' },
  { name: 'Tan',        nameAr: 'كستنائي',  hex: '#a0622a', image: 'images/wallet-1.jpg' },
  { name: 'Cognac',     nameAr: 'كونياك',   hex: '#7b3f1e', image: 'images/wallet-5.jpg' },
  { name: 'Black',      nameAr: 'أسود',     hex: '#1a1a1a', image: 'images/wallet-6.jpg' },
];

const CARD_COLORS: ColorOption[] = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/card-1.jpg' },
  { name: 'Tan',        nameAr: 'كستنائي',  hex: '#a0622a', image: 'images/card-2.jpg' },
  { name: 'Black',      nameAr: 'أسود',     hex: '#1a1a1a', image: 'images/card-3.jpg' },
];

const PORTFOLIO_COLORS: ColorOption[] = [
  { name: 'Natural',   nameAr: 'نباتي',    hex: '#c4a46b', image: 'images/portfolio-1.jpg' },
];

const LONG_WALLET_COLORS: ColorOption[] = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/longwallet-1.jpg' },
  { name: 'Tan',        nameAr: 'كستنائي',  hex: '#a0622a', image: 'images/longwallet-2.jpg' },
];

const SLIPPER_COLORS: ColorOption[] = [
  { name: 'Dark Brown', nameAr: 'بني غامق', hex: '#3b1f0e', image: 'images/belt-4.jpg' },
  { name: 'Black',      nameAr: 'أسود',     hex: '#1a1a1a', image: 'images/belt-4.jpg' },
  { name: 'Honey',      nameAr: 'عسلي',     hex: '#c47e2b', image: 'images/belt-4.jpg' },
];

@Injectable({ providedIn: 'root' })
export class ProductsService {
  readonly all: Product[] = [
    // ── BELTS ──
    {
      id: 1, nameEn: 'Classic Leather Belt', nameAr: 'حزام جلد كلاسيك',
      price: 350, image: 'images/belt-1.jpg', category: 'belts', inStock: true,
      descEn: 'A timeless classic handcrafted from genuine full-grain leather. Durable, elegant, and made to last for years.',
      descAr: 'حزام كلاسيكي خالد مصنوع يدوياً من جلد طبيعي عالي الجودة. متين وأنيق ومصمم ليدوم لسنوات.',
      colors: BELT_COLORS,
    },
    {
      id: 2, nameEn: 'Wide Leather Belt', nameAr: 'حزام جلد عريض',
      price: 420, image: 'images/belt-2.jpg', category: 'belts', inStock: true,
      descEn: 'A bold wide-cut belt for a statement look. Perfect for casual and semi-formal wear.',
      descAr: 'حزام عريض بجرأة لإطلالة مميزة. مثالي للإطلالات الكاجوال وشبه الرسمية.',
      colors: BELT_COLORS,
    },
    {
      id: 3, nameEn: 'Heritage Belt', nameAr: 'حزام هيريتاج',
      price: 390, image: 'images/belt-5.jpg', category: 'belts', inStock: true,
      descEn: 'Heritage-style belt with a classic buckle. Crafted from natural vegetable-tanned leather.',
      descAr: 'حزام بأسلوب هيريتاج مع إبزيم كلاسيكي. مصنوع من الجلد المدبوغ نباتياً.',
      colors: BELT_COLORS,
    },
    // ── WALLETS ──
    {
      id: 4, nameEn: 'Slim Bifold Wallet', nameAr: 'محفظة سليم بيفولد',
      price: 550, image: 'images/wallet-1.jpg', category: 'wallets', inStock: true,
      descEn: 'Slim and minimalist bifold wallet. Holds cards and cash without the bulk.',
      descAr: 'محفظة بيفولد رفيعة ومينيمالية. تحتوي على البطاقات والنقود بدون ضخامة.',
      colors: WALLET_COLORS,
    },
    {
      id: 5, nameEn: 'Full-Grain Wallet', nameAr: 'محفظة فل جرين',
      price: 650, image: 'images/wallet-2.jpg', category: 'wallets', inStock: true,
      descEn: 'Premium full-grain leather wallet that develops a beautiful patina over time.',
      descAr: 'محفظة من الجلد الطبيعي الكامل تكتسب جمالاً طبيعياً مع الوقت.',
      colors: WALLET_COLORS,
    },
    {
      id: 6, nameEn: 'Classic Bifold', nameAr: 'محفظة بيفولد كلاسيك',
      price: 580, image: 'images/wallet-5.jpg', category: 'wallets', inStock: true,
      descEn: 'The everyday classic. A clean bifold with generous card slots.',
      descAr: 'الكلاسيك اليومي. بيفولد نظيف مع فتحات بطاقات وافرة.',
      colors: WALLET_COLORS,
    },
    // ── MEN'S LONG WALLETS ──
    {
      id: 7, nameEn: "Men's Long Wallet", nameAr: 'محفظة طويلة رجالي',
      price: 720, image: 'images/longwallet-1.jpg', category: 'longWallets', inStock: true,
      descEn: 'Spacious long wallet with multiple compartments for cards, cash, and documents.',
      descAr: 'محفظة طويلة واسعة بحجرات متعددة للبطاقات والنقود والوثائق.',
      colors: LONG_WALLET_COLORS,
    },
    {
      id: 8, nameEn: "Men's Zip Long Wallet", nameAr: 'محفظة طويلة زيب رجالي',
      price: 780, image: 'images/longwallet-2.jpg', category: 'longWallets', inStock: true,
      descEn: 'Premium zip-around long wallet with secure closure and multiple pockets.',
      descAr: 'محفظة طويلة زيب فاخرة مع إغلاق آمن وجيوب متعددة.',
      colors: LONG_WALLET_COLORS,
    },
    // ── PORTEFEUILLE (WOMEN'S) ──
    {
      id: 9, nameEn: "Portefeuille — Women's", nameAr: 'بورتفيه نسائي',
      price: 680, image: 'images/portfolio-1.jpg', category: 'portefeuille', inStock: true,
      descEn: "Elegant women's long leather wallet. Natural vegetable-tanned finish, silky smooth.",
      descAr: 'بورتفيه جلد نسائي أنيق. مشغول بالدباغة النباتية الطبيعية، ناعم الملمس.',
      colors: PORTFOLIO_COLORS,
    },
    {
      id: 10, nameEn: "Portefeuille Slim", nameAr: 'بورتفيه سليم نسائي',
      price: 620, image: 'images/portfolio-2.jpg', category: 'portefeuille', inStock: true,
      descEn: "Slim portefeuille with a refined natural leather finish. Perfect everyday companion.",
      descAr: 'بورتفيه رفيع بلمسة جلد طبيعي راقية. رفيق مثالي لكل يوم.',
      colors: PORTFOLIO_COLORS,
    },
    // ── CARD HOLDERS ──
    {
      id: 11, nameEn: 'Minimalist Card Holder', nameAr: 'كارت هولدر مينيمال',
      price: 280, image: 'images/card-1.jpg', category: 'cardHolders', inStock: true,
      descEn: 'Ultra-slim card holder for the modern minimalist. Fits 4–6 cards comfortably.',
      descAr: 'كارت هولدر نحيف للغاية للشخصية العصرية المينيمالية. يحمل 4-6 بطاقات.',
      colors: CARD_COLORS,
    },
    {
      id: 12, nameEn: 'Snap Card Holder', nameAr: 'كارت هولدر سناب',
      price: 320, image: 'images/card-2.jpg', category: 'cardHolders', inStock: true,
      descEn: 'Secure snap-closure card holder with easy card access.',
      descAr: 'كارت هولدر بقفل سناب آمن مع سهولة الوصول للبطاقات.',
      colors: CARD_COLORS,
    },
    // ── SLIPPERS ──
    {
      id: 13, nameEn: 'Leather Slipper — Classic', nameAr: 'شبشب جلد كلاسيك',
      price: 800, image: 'images/belt-4.jpg', category: 'slippers', inStock: true,
      descEn: 'Handcrafted classic leather slippers for ultimate comfort.',
      descAr: 'شبشب جلد كلاسيك مصنوع يدوياً لراحة قصوى.',
      colors: SLIPPER_COLORS,
    },
  ];

  getById(id: number): Product | undefined {
    return this.all.find(p => p.id === id);
  }

  getByCategory(category: string): Product[] {
    if (category === 'all') return this.all;
    return this.all.filter(p => p.category === category);
  }
}
