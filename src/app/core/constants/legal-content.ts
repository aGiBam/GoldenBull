import { GOVERNORATES } from './governorates';

export interface LegalSection {
  titleEn: string;
  titleAr: string;
  bodyEn: string[];
  bodyAr: string[];
}

export interface LegalPageContent {
  titleEn: string;
  titleAr: string;
  intro: { en: string; ar: string };
  sections: LegalSection[];
}

const shippingFeesTableEn =
  'Estimated courier fee by governorate (paid to the courier on delivery, not collected at checkout):\n' +
  GOVERNORATES.map((g) => `${g.en}: ${g.fee} EGP`).join('\n');

const shippingFeesTableAr =
  'تكلفة الشحن التقديرية حسب المحافظة (تُدفع لمندوب التوصيل عند الاستلام، مش بتتحصل أونلاين):\n' +
  GOVERNORATES.map((g) => `${g.ar}: ${g.fee} جنيه`).join('\n');

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  shipping: {
    titleEn: 'Shipping Policy',
    titleAr: 'سياسة الشحن',
    intro: {
      en: 'Every order is made to order, not pulled from ready warehouse stock — that\'s why timelines are a bit longer than typical retail, and why we ask for a deposit up front (see our Terms & Conditions).',
      ar: 'كل طلب بيتعمل خصيصًا وقت الطلب، مش موجود جاهز في مخزن — عشان كده مدة التجهيز أطول من المتاجر العادية، وعشان كده بنطلب عربون مقدمًا (تفاصيل أكتر في صفحة الأحكام والشروط).',
    },
    sections: [
      {
        titleEn: 'Delivery Times',
        titleAr: 'مواعيد التوصيل',
        bodyEn: [
          'Cairo & Giza: 3–5 business days after order confirmation.',
          'Other governorates: 5–8 business days after order confirmation.',
          'Custom or made-to-order pieces may take longer — we will tell you the estimated date when we confirm your order.',
        ],
        bodyAr: [
          'القاهرة والجيزة: من 3 إلى 5 أيام عمل بعد تأكيد الطلب.',
          'باقي المحافظات: من 5 إلى 8 أيام عمل بعد تأكيد الطلب.',
          'القطع المخصصة قد تاخد وقت أطول — هنقولك الموعد التقريبي وقت تأكيد الطلب.',
        ],
      },
      {
        titleEn: 'Who Pays for Shipping',
        titleAr: 'مين بيدفع تكلفة الشحن',
        bodyEn: [
          'The customer covers the courier/shipping fee, paid directly to the delivery agent on arrival (not included in the online deposit).',
          shippingFeesTableEn,
        ],
        bodyAr: [
          'العميل هو اللي بيتحمل تكلفة الشحن، وتُدفع مباشرة لمندوب التوصيل عند الوصول (مش جزء من العربون المدفوع أونلاين).',
          shippingFeesTableAr,
        ],
      },
      {
        titleEn: 'Responsibilities',
        titleAr: 'المسؤوليات',
        bodyEn: [
          'Seller: package the order securely, hand it to the courier within the stated timeline, and share tracking/updates when available.',
          'Customer: provide an accurate, complete address and be reachable on the phone number given at checkout so delivery isn\'t delayed.',
        ],
        bodyAr: [
          'البائع: يجهّز الطلب بعناية ويسلمه لشركة الشحن في الموعد المحدد، ويبلغ العميل بأي تحديثات لو متاحة.',
          'العميل: يكتب عنوان صحيح وكامل ويكون متاح على رقم الموبايل اللي كتبه وقت الطلب عشان التوصيل ميتأخرش.',
        ],
      },
    ],
  },
  privacy: {
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    intro: {
      en: 'We collect the minimum information needed to process and deliver your order — nothing more.',
      ar: 'بنجمع أقل قدر من المعلومات اللازمة عشان نجهز ونوصّل طلبك — مش أكتر من كده.',
    },
    sections: [
      {
        titleEn: 'What We Collect',
        titleAr: 'إيه اللي بنجمعه',
        bodyEn: [
          'Name, phone number, and delivery address, provided at checkout.',
          'Email address and account details, only if you choose to create an account.',
          'Order history, for order tracking and customer support.',
        ],
        bodyAr: [
          'الاسم، رقم الهاتف، وعنوان التوصيل اللي بتكتبه وقت الطلب.',
          'الإيميل وبيانات الحساب، بس لو اخترت تعمل حساب.',
          'سجل الطلبات، عشان متابعة الطلب ودعم العملاء.',
        ],
      },
      {
        titleEn: 'How We Use It',
        titleAr: 'إزاي بنستخدمها',
        bodyEn: [
          'To process, confirm, and deliver your order.',
          'To contact you about your order status.',
          'We do not sell or share your data with third parties for marketing purposes.',
        ],
        bodyAr: [
          'لتجهيز وتأكيد وتوصيل طلبك.',
          'للتواصل معاك بخصوص حالة الطلب.',
          'إحنا مش بنبيع أو نشارك بياناتك مع أي جهة تالتة لأغراض تسويقية.',
        ],
      },
      {
        titleEn: 'Your Rights',
        titleAr: 'حقوقك',
        bodyEn: [
          'You can request to view, correct, or delete your account data at any time via your profile settings or by contacting us.',
        ],
        bodyAr: [
          'تقدر تطلب تشوف أو تعدّل أو تمسح بيانات حسابك في أي وقت من إعدادات البروفايل أو بالتواصل معانا.',
        ],
      },
      {
        titleEn: 'Contact',
        titleAr: 'التواصل',
        bodyEn: ['goldenbull.support@gmail.com'],
        bodyAr: ['goldenbull.support@gmail.com'],
      },
    ],
  },
  terms: {
    titleEn: 'Terms & Conditions',
    titleAr: 'الأحكام والشروط',
    intro: {
      en: 'Please read these terms carefully before placing an order. Golden Bull pieces are made to order, not mass-produced — this is what makes each piece special, and it\'s also why the process below matters.',
      ar: 'من فضلك اقرأ الشروط دي كويس قبل ما تعمل طلب. منتجات Golden Bull بتتعمل خصيصًا وقت الطلب مش إنتاج جاهز بالجملة — ده اللي بيدي كل قطعة طابعها الخاص، وده كمان سبب أهمية الخطوات اللي جاية.',
    },
    sections: [
      {
        titleEn: 'Order Confirmation',
        titleAr: 'تأكيد الطلب',
        bodyEn: [
          'Placing an order on the site is a request, not a final confirmation. We contact you by phone to confirm the details before production/preparation begins.',
        ],
        bodyAr: [
          'عمل الطلب على الموقع هو طلب مبدئي مش تأكيد نهائي. بنتواصل معاك تليفونيًا لتأكيد التفاصيل قبل ما نبدأ التجهيز.',
        ],
      },
      {
        titleEn: 'Deposit / Down Payment',
        titleAr: 'العربون / الدفعة المقدمة',
        bodyEn: [
          'A 20% deposit is required to confirm every order, regardless of payment method. This is because each item is prepared specifically for your order rather than pulled from ready stock, and the deposit protects both sides from cancelled custom orders.',
        ],
        bodyAr: [
          'مطلوب عربون 20% لتأكيد أي طلب، أيًا كانت وسيلة الدفع. السبب إن كل قطعة بتتجهز خصيصًا لطلبك مش من مخزون جاهز، والعربون بيحمي الطرفين من إلغاء طلبات مخصصة بعد التجهيز.',
        ],
      },
      {
        titleEn: 'Shipping Cost',
        titleAr: 'تكلفة الشحن',
        bodyEn: ['The customer is responsible for the shipping/courier fee, paid on delivery — see our Shipping Policy for estimated fees per governorate.'],
        bodyAr: ['العميل مسؤول عن تكلفة الشحن، وتُدفع عند الاستلام — راجع صفحة سياسة الشحن للتكلفة التقديرية لكل محافظة.'],
      },
      {
        titleEn: 'Returns & Refunds',
        titleAr: 'الاسترجاع واسترداد الأموال',
        bodyEn: [
          'Because items are custom-prepared per order, we only accept returns for manufacturing defects or an item that doesn\'t match what was ordered. Contact us within 3 days of delivery with photos of the issue.',
          'The deposit is non-refundable if the customer cancels the order after confirmation without a valid defect.',
        ],
        bodyAr: [
          'بما إن كل قطعة بتتجهز خصيصًا للطلب، بنقبل الاسترجاع بس في حالة وجود عيب صناعة أو اختلاف عن اللي اتطلب. تواصل معانا خلال 3 أيام من الاستلام مع صور توضح المشكلة.',
          'العربون غير قابل للاسترداد لو العميل ألغى الطلب بعد التأكيد من غير عيب حقيقي.',
        ],
      },
      {
        titleEn: 'Obligations',
        titleAr: 'الالتزامات',
        bodyEn: [
          'Seller: prepare and deliver the confirmed order accurately and within the communicated timeline.',
          'Customer: provide accurate order/address details and pay the deposit and shipping fee as agreed.',
        ],
        bodyAr: [
          'البائع: يجهّز ويسلّم الطلب المؤكد بدقة وفي الموعد المتفق عليه.',
          'العميل: يوفر بيانات طلب وعنوان صحيحة ويدفع العربون وتكلفة الشحن حسب المتفق عليه.',
        ],
      },
    ],
  },
  reviews: {
    titleEn: 'Reviews Policy',
    titleAr: 'سياسة التقييمات',
    intro: {
      en: 'We welcome honest feedback — it helps us and helps other customers.',
      ar: 'بنرحب بأي رأي صادق — بيفيدنا وبيفيد العملاء التانيين.',
    },
    sections: [
      {
        titleEn: 'Guidelines',
        titleAr: 'إرشادات التقييم',
        bodyEn: [
          'Reviews should be based on a genuine purchase or interaction with Golden Bull.',
          'Please keep feedback respectful and specific — what you liked, what could improve.',
        ],
        bodyAr: [
          'التقييمات لازم تكون مبنية على شراء أو تعامل فعلي مع Golden Bull.',
          'خلي الرأي محترم ومحدد — إيه اللي عجبك وإيه اللي ممكن يتحسن.',
        ],
      },
      {
        titleEn: 'Moderation',
        titleAr: 'المراجعة',
        bodyEn: [
          'We may remove reviews that contain abusive language, spam, or unrelated content, but we do not remove honest negative feedback about product or service quality.',
        ],
        bodyAr: [
          'ممكن نشيل أي تقييم فيه إساءة أو سبام أو محتوى مش له علاقة، لكن مش بنشيل أي رأي سلبي صادق عن جودة المنتج أو الخدمة.',
        ],
      },
      {
        titleEn: 'Transparency',
        titleAr: 'الشفافية',
        bodyEn: ['We do not pay for reviews or edit customer wording to make it more positive.'],
        bodyAr: ['إحنا مش بندفع مقابل تقييمات ولا بنعدّل كلام العملاء عشان يبقى أكتر إيجابية.'],
      },
    ],
  },
};
