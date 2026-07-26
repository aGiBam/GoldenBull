/** Egyptian governorates with an estimated Cash-on-Delivery courier fee.
 * The fee is informational only (paid to the courier on delivery, not
 * collected at checkout) — shown at checkout and on the shipping policy page
 * so customers know roughly what to expect before ordering. Adjust the
 * numbers to match your actual courier rates whenever they change. */
export interface Governorate {
  en: string;
  ar: string;
  fee: number;
}

export const GOVERNORATES: Governorate[] = [
  { en: 'Cairo', ar: 'القاهرة', fee: 60 },
  { en: 'Giza', ar: 'الجيزة', fee: 60 },
  { en: 'Alexandria', ar: 'الإسكندرية', fee: 70 },
  { en: 'Qalyubia', ar: 'القليوبية', fee: 65 },
  { en: 'Sharqia', ar: 'الشرقية', fee: 70 },
  { en: 'Dakahlia', ar: 'الدقهلية', fee: 70 },
  { en: 'Gharbia', ar: 'الغربية', fee: 70 },
  { en: 'Monufia', ar: 'المنوفية', fee: 70 },
  { en: 'Beheira', ar: 'البحيرة', fee: 75 },
  { en: 'Kafr El Sheikh', ar: 'كفر الشيخ', fee: 75 },
  { en: 'Damietta', ar: 'دمياط', fee: 80 },
  { en: 'Port Said', ar: 'بورسعيد', fee: 80 },
  { en: 'Ismailia', ar: 'الإسماعيلية', fee: 80 },
  { en: 'Suez', ar: 'السويس', fee: 80 },
  { en: 'Faiyum', ar: 'الفيوم', fee: 80 },
  { en: 'Beni Suef', ar: 'بني سويف', fee: 85 },
  { en: 'Minya', ar: 'المنيا', fee: 90 },
  { en: 'Asyut', ar: 'أسيوط', fee: 100 },
  { en: 'Sohag', ar: 'سوهاج', fee: 100 },
  { en: 'Qena', ar: 'قنا', fee: 110 },
  { en: 'Luxor', ar: 'الأقصر', fee: 120 },
  { en: 'Aswan', ar: 'أسوان', fee: 130 },
  { en: 'Red Sea', ar: 'البحر الأحمر', fee: 130 },
  { en: 'New Valley', ar: 'الوادي الجديد', fee: 140 },
  { en: 'Matrouh', ar: 'مطروح', fee: 120 },
  { en: 'North Sinai', ar: 'شمال سيناء', fee: 140 },
  { en: 'South Sinai', ar: 'جنوب سيناء', fee: 130 },
];
