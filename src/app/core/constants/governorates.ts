/** Egyptian governorates with an estimated Cash-on-Delivery courier fee,
 * calculated from the shop's actual shipping origin (Tanta, Gharbia) rather
 * than Cairo — so nearby Delta governorates are cheapest and Upper
 * Egypt/Sinai/Red Sea/frontier governorates are the most expensive. The fee
 * is informational only (paid to the courier on delivery, not collected at
 * checkout) — shown at checkout and on the shipping policy page so customers
 * know roughly what to expect before ordering. These are approximate
 * placeholder numbers — replace with your real courier's rate card whenever
 * you have it. */
export interface Governorate {
  en: string;
  ar: string;
  fee: number;
}

export const GOVERNORATES: Governorate[] = [
  { en: 'Gharbia', ar: 'الغربية', fee: 50 },
  { en: 'Kafr El Sheikh', ar: 'كفر الشيخ', fee: 55 },
  { en: 'Monufia', ar: 'المنوفية', fee: 55 },
  { en: 'Dakahlia', ar: 'الدقهلية', fee: 60 },
  { en: 'Beheira', ar: 'البحيرة', fee: 60 },
  { en: 'Qalyubia', ar: 'القليوبية', fee: 65 },
  { en: 'Damietta', ar: 'دمياط', fee: 65 },
  { en: 'Sharqia', ar: 'الشرقية', fee: 65 },
  { en: 'Alexandria', ar: 'الإسكندرية', fee: 70 },
  { en: 'Cairo', ar: 'القاهرة', fee: 70 },
  { en: 'Giza', ar: 'الجيزة', fee: 75 },
  { en: 'Port Said', ar: 'بورسعيد', fee: 80 },
  { en: 'Ismailia', ar: 'الإسماعيلية', fee: 80 },
  { en: 'Suez', ar: 'السويس', fee: 85 },
  { en: 'Faiyum', ar: 'الفيوم', fee: 90 },
  { en: 'Beni Suef', ar: 'بني سويف', fee: 95 },
  { en: 'Minya', ar: 'المنيا', fee: 100 },
  { en: 'Asyut', ar: 'أسيوط', fee: 110 },
  { en: 'Sohag', ar: 'سوهاج', fee: 115 },
  { en: 'Qena', ar: 'قنا', fee: 125 },
  { en: 'Matrouh', ar: 'مطروح', fee: 130 },
  { en: 'Luxor', ar: 'الأقصر', fee: 135 },
  { en: 'South Sinai', ar: 'جنوب سيناء', fee: 140 },
  { en: 'Red Sea', ar: 'البحر الأحمر', fee: 140 },
  { en: 'Aswan', ar: 'أسوان', fee: 145 },
  { en: 'North Sinai', ar: 'شمال سيناء', fee: 145 },
  { en: 'New Valley', ar: 'الوادي الجديد', fee: 150 },
];
