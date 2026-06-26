# خطة الـ10 أيام — Angular E-commerce (Angular 22 + PrimeNG + Transloco)

**الهدف:** بناء متجر إلكتروني متكامل (Storefront + Auth/RBAC + Admin Dashboard + Order History) مع تطبيق كل نقطة في Junior Roadmap اللي بعتها التيم ليدر + جزء حقيقي من Mid-level، بطريقة مرتبة يوم بيوم بدل الاشتغال العشوائي.

**المدة:** 10 أيام × 3-4 ساعات/يوم (~35-40 ساعة فعلية).
**Stack:** Angular 22 (standalone components بشكل كامل، مفيش NgModules) + PrimeNG (theming بـ `@primeuix/themes` / Aura preset) + Transloco (`@jsverse/transloco`, signal-based).
**Backend:** مفيش backend حقيقي — `json-server` (أو express صغير فوقه) كـ mock API، عشان تركز على Angular نفسه مش على الباك إند.

> ملاحظة عن الإصدار: Angular 22 (يونيو 2026) ثبّت Signal Forms و Angular Aria و selectorless components، بس دول مش مطلوبين في الـroadmap اللي بعتها التيم ليدر. سيبهم لاستكشاف شخصي بعد الـ10 أيام — مفيش داعي تزود نطاق المهمة دلوقتي.

---

## القاعدة العامة لكل يوم (Definition of Done)

1. الفيتشر اللي اتعمل النهاردة شغال من الـUI فعليًا (مش كومنت أو TODO).
2. الـ build نضيف من غير console errors.
3. تعمل commit بصيغة: `day-N: <feature> | roadmap: <items>` — ده بيوثق تقدمك لو التيم ليدر سألك.
4. قبل ما تقفل، اكتب لنفسك سطر واحد: "بكرة أول حاجة هعملها هي ...". ده اللي يقتل إحساس "بدأت من غير خطة".

---

## هيكلة المشروع (تتعمل مرة واحدة يوم 1)

```
src/app/
  core/            -> guards, interceptors, tokens, app-config, auth state
  shared/          -> reusable UI components, pipes, directives, PrimeNG wrappers
  features/
    storefront/    -> home, product-list, product-detail, cart, checkout
    auth/          -> login, register
    account/       -> order-history (customer)
    admin/         -> products-crud, categories-crud, orders-management (lazy loaded)
  app.config.ts    -> providers (Transloco, PrimeNG, HttpClient, interceptors, APP_INITIALIZER)
  app.routes.ts    -> root routes (+ lazy loadChildren لـ admin/account)
mock-server/
  db.json          -> products, categories, users, orders
  server.js        -> json-server + auth middleware بسيط
```

---

## يوم 1 — Setup & Foundations

**Roadmap:** Components (structure/metadata/templates/styles) · Environment configs (Mid) · InjectionToken & APP_INITIALIZER (Mid)

- `ng new` بـ standalone (افتراضي في Angular 22)، تثبيت `primeng @primeuix/themes` و `@jsverse/transloco`.
- `app.config.ts`: `providePrimeNG({ theme: { preset: Aura } })`, `provideTransloco(...)`, `provideHttpClient(withInterceptors([...]))`.
- استخدم `APP_INITIALIZER` (أو `provideAppInitializer` في الإصدارات الحديثة) عشان يحمّل لغة Transloco الافتراضية وملف config بسيط (مثلاً `assets/app-config.json`) *قبل* ما الأبليكيشن يبوت — ده أول استخدام عملي لـ InjectionToken لأنك هتعمل token لـ `APP_CONFIG` وتحقنه بدل ما تستورد JSON مباشر.
- اعمل `mock-server/db.json` بمنتجات وكاتيجوريز وعمال تشغّله بـ `npx json-server mock-server/db.json`.
- Shared layout: Navbar + Footer + Language switcher (Transloco) كـ standalone components.

**Definition of done:** التطبيق شغال، فيه navbar مترجم بلغتين (ar/en)، و config بيتحمّل قبل أي حاجة تانية.

---

## يوم 2 — Routing, Navigation, Lazy Loading

**Roadmap:** Routing & Navigation (basic + nested) · Routing Enhancements: lazy loading strategies · Preloading strategies (Mid) · Feature/standalone components (Mid)

- `app.routes.ts`: مسارات الـStorefront (home, products, product/:id, cart, checkout) + `loadChildren` لـ `admin.routes.ts` و `account.routes.ts` (lazy).
- استخدم `loadComponent` للصفحات المنفردة (مش لازم كل حاجة تكون feature module/lazy children، استفد من standalone lazy loading الحقيقي).
- جرّب `PreloadAllModules` أو preloading strategy مخصصة (مثلاً تأخير preload للـadmin لحد ما الصفحة الرئيسية تخلص تحميل).
- Skeleton pages فاضية لكل route، نافيجيشن شغالة بين كل الصفحات.

**Definition of done:** كل الروابط بتوصل، الـadmin route بيتعمله lazy load (تأكد من الـNetwork tab إنه ملف منفصل).

---

## يوم 3 — Components, Data Binding, Directives, Pipes (Catalog UI)

**Roadmap:** Component lifecycle (ngOnInit/ngOnChanges) · Data Binding (الأربعة) · Built-in directives (*ngIf, *ngFor, ngSwitch, ngClass, ngStyle) · Template reference variables · Built-in pipes (date, currency) · TrackBy · Debugging بـ Angular DevTools

- صفحة Product List: PrimeNG (DataView أو Table) + بيانات mock ثابتة في الكومبوننت لحد النهاردة (الـHttpClient بكرة).
- فلتر بالكاتيجوري (`ngSwitch`/`ngClass` لتلوين الباجدات: "out of stock" مثلاً)، حقل بحث بـ template reference variable (`#searchInput`)، `*ngFor` مع `trackBy` على المنتجات.
- `ngOnChanges` على component بسيط بياخد `@Input()` (مثلاً product card بياخد product وبيتفاعل لو تغيّر).
- استخدم `NgOptimizedImage` لصور المنتجات (Mid-level item، خفيف وهيفرق في الأداء).
- افتح Angular DevTools وشوف component tree + change detection cycles وقت الفلترة.

**Definition of done:** صفحة كتالوج كاملة UI-wise، بحث وفلترة شغالين على بيانات ثابتة.

---

## يوم 4 — Services, DI Hierarchy, HttpClient CRUD, Resolver

**Roadmap:** Services & basic DI · CRUD with HttpClient · DI hierarchy (root vs component, Mid) · Routing Enhancements: resolvers

- `ProductService` و `CategoryService` بـ `providedIn: 'root'`، بيعملوا CRUD حقيقي على `json-server` (GET/POST/PUT/DELETE).
- اربط صفحة الكتالوج بالـservice الحقيقي بدل البيانات الثابتة.
- جرّب الفرق العملي بين provider على `root` و provider على component واحد بس (مثلاً اعمل service بسيط وحقنه في `providers` بتاع كومبوننت معيّن، وشوف إنه بيتعمله instance جديد كل مرة الكومبوننت يتعمل).
- **هنا أول استخدام لـ `useClass`** (تفاصيله كاملة في القسم المخصص تحت) — `NotificationService` بتتبدّل implementation حسب الـenvironment.
- Resolver لصفحة Product Detail: يجيب المنتج قبل ما الراوت يخلص navigation (`resolve: { product: productResolver }`).

**Definition of done:** الكتالوج شغال على بيانات حقيقية من json-server، صفحة تفاصيل المنتج بتستخدم resolver، NotificationService شغال بـ useClass.

---

## يوم 5 — Forms (Reactive + Template-Driven) + ViewChild

**Roadmap:** Forms (Reactive, Template-Driven) · ViewChild basics

- Checkout form (Reactive Forms): shipping info + validation (required, email, pattern للتليفون).
- Register/Login forms: جرّب واحد منهم Template-Driven عشان تحس بالفرق عمليًا (مثلاً Login بسيط Template-Driven، Register و Checkout Reactive لأنهم أعقد).
- `ViewChild`: مثلاً تركيز أول حقل فيه error بعد submit فاشل، أو قراءة reference لـ PrimeNG component (Calendar/Stepper) من الكود.
- Admin: form إضافة/تعديل منتج (Reactive Forms) — هتستخدمه يوم 9.

**Definition of done:** 3 فورمز شغالة (login, register/checkout, admin product) بفاليديشن واضح، ViewChild مستخدم استخدام حقيقي مش tutorial-style.

---

## يوم 6 — Auth, RBAC, Interceptors, useExisting

**Roadmap:** Authentication & Authorization (guards, RBAC, token refresh) · Interceptors (JWT, error handling, logging) (Mid)

- `AuthService`: login بيرجع fake JWT (الـmock server بيعمل encode بسيط لـ user id + role)، تخزين التوكن، `logout`.
- `authInterceptor`: يضيف `Authorization: Bearer <token>` على كل request، و `errorInterceptor` يتعامل مع 401 (logout تلقائي) و401-retry بسيط لمحاكاة token refresh.
- `authGuard` (canActivate/canMatch) على `/account/**`، و `adminGuard` (RBAC: role === 'admin') على `/admin/**`.
- **هنا `useExisting`** (التفاصيل في القسم تحت) — `CartFacade` متظبط كـ alias لـ `CartService` الموجود فعلاً، عشان تثبت إن useClass هنا كان هيبوّظ الحالة.

**Definition of done:** مستخدم عادي مايقدرش يدخل `/admin`، توكن بيتبعت مع كل request، الـCartFacade بيشير لنفس instance بتاع CartService.

---

## يوم 7 — RxJS State Management + Signals Bridge

**Roadmap:** Subjects & BehaviorSubjects · Key operators (switchMap, mergeMap, takeUntil, combineLatest) · Subscription management & async pipe best practices (Mid) · Signals (basic مع RxJS, Mid)

- `CartService` و `AuthService` (state) بـ `BehaviorSubject` + `items$` Observable، استخدام `async` pipe في التمبلت بدل `subscribe` مانيوال في كل مكان.
- `combineLatest` لعمل ملخص الكارت (سعر إجمالي + عدد العناصر) من أكتر من stream.
- `switchMap` في البحث (search-as-you-type) مع `takeUntil`/`destroyRef` لإلغاء الاشتراك عند تدمير الكومبوننت.
- جرّب bridge بسيط: `toSignal(cart.items$)` عشان تستخدم القيمة كـ signal في تمبلت معيّن — ده بالضبط معنى "Hybrid Signals + RxJS" بشكل مصغّر وعملي.
- `mergeMap`: استخدمه في Admin لو عندك bulk action (مثلاً تأكيد أكتر من طلب دفعة واحدة) — لازم يحصل بالتوازي مش متتالي زي switchMap اللي بيلغي الـrequest القديم.

**Definition of done:** صفر `subscribe()` مكشوف في أي component (كله async pipe أو toSignal)، الكارت بيتحدث live في كل الصفحات.

---

## يوم 8 — PrimeNG Polish (Dialogs, Tables, Stepper)

**Roadmap:** Dialogs, Tables, Stepper (Mid) · مراجعة Built-in pipes/TrackBy

- Admin Products/Orders: PrimeNG `Table` مع sorting/filtering/pagination حقيقي على بيانات الـjson-server.
- Dialog تأكيد قبل أي Delete (منتج/كاتيجوري).
- حوّل Checkout لـ `Stepper`: shipping → payment (mock) → review.
- راجع كل `*ngFor` في المشروع وتأكد إن trackBy موجود في القوائم الطويلة (catalog, admin tables).

**Definition of done:** Admin tables تفاعلية بالكامل، checkout بقى multi-step، مفيش قايمة طويلة من غير trackBy.

---

## يوم 9 — i18n كامل + Admin CRUD + Order History + Performance

**Roadmap:** Shared vs Core organisation (Mid) · Change detection (OnPush, markForCheck, Mid) · Image optimization (Mid)

- Transloco: ترجمة كل التطبيق (ar/en) فعليًا، مش بس الـnavbar — مع التبديل لـ `dir="rtl"` تلقائي مع العربي (مهم جدًا مع PrimeNG، شوف إزاي الكومبوننتس بتتصرف RTL).
- إكمال Admin CRUD: Categories + تحديث حالة الطلب (pending/shipped/delivered).
- صفحة "طلباتي" للعميل (Order History) من بيانات الـjson-server المرتبطة بالـuser.
- `ChangeDetectionStrategy.OnPush` على component الكتالوج وجدول الـadmin + `markForCheck`/`detectChanges` فين بالظبط محتاجهم بعد OnPush.

**Definition of done:** الموقع بالكامل بلغتين مع RTL سليم، Order History شغالة، صفحتين على الأقل بـOnPush ومُثبت إنهم لسه بيتحدثوا صح.

---

## يوم 10 — Testing, Bug Bash, Wrap-up

**Roadmap:** Intro to unit testing (components & services) · Unit tests for services/pipes/directives (Mid) · Bundle analysis (Mid, stretch)

- Unit tests: `CartService` (add/remove/total)، `AuthService` (login success/fail)، component واحد (مثلاً ProductCard) — استخدم نفس فكرة `useClass: MockNotificationService` جوه التيست عشان تعزل PrimeNG `MessageService`.
- Bug bash: امشي على كل الـuser flows (browse → cart → checkout → order history، وadmin CRUD) واكتب أي مشكلة تلاقيها.
- (Stretch) `source-map-explorer` لتحليل حجم الـbundle.
- اكتب README مختصر (إزاي تشغّل المشروع + الـmock server) + ملخص يوم بيوم للتيم ليدر.

**Definition of done:** تيستات أساسية شغالة وعدّاية، README موجود، مشكلة معروفة (لو فيه) متوثقة بدل ما تتخبى.

---

## DI Deep Dive: useClass vs useExisting — Use Case حقيقي في المشروع

التيم ليدر طلب use case تطبّق فيه `useClass` و `useExisting` مع إنك لسه في أول DI — وده فعلاً مفهوم بسيط لو ربطته بحاجة ملموسة. الفكرة الأساسية:

- **`useClass`**: "لما حد يطلب التوكن ده، اعمل instance **جديدة** من الكلاس ده." بتستخدمها لما عندك أكتر من implementation لنفس الـabstraction وعايز تختار واحدة وقت الإقلاع (environment, testing, feature flag).
- **`useExisting`**: "لما حد يطلب التوكن ده، رجّع له **نفس instance** الموجودة بالفعل لتوكن/كلاس تاني — متعملش حاجة جديدة." بتستخدمها للـaliasing: توكنين (أو أكتر) بيرجعوا لنفس الـsingleton، عشان تتجنب duplicate state.

### مثال 1 — `useClass`: NotificationService حسب الـenvironment

```ts
// notification.service.ts
export abstract class NotificationService {
  abstract show(message: string, severity: 'success' | 'error' | 'info'): void;
}

@Injectable()
export class PrimeNgNotificationService extends NotificationService {
  constructor(private messageService: MessageService) { super(); }
  show(message: string, severity: 'success'|'error'|'info') {
    this.messageService.add({ severity, detail: message });
  }
}

@Injectable()
export class MockNotificationService extends NotificationService {
  show(message: string, severity: string) {
    console.log(`[mock-notify:${severity}]`, message);
  }
}

// app.config.ts
providers: [
  {
    provide: NotificationService,
    useClass: environment.useMockNotifications ? MockNotificationService : PrimeNgNotificationService,
  },
]
```

كل مكان في المشروع بيحقن `NotificationService` (مش الكلاس الحقيقي) — يوم الاختبار أو يوم تشغيل بدون PrimeNG MessageService، تبدّل provider واحد في مكان واحد ومفيش حاجة تانية تتغيّر.

### مثال 2 — `useExisting`: CartFacade alias لـ CartService

المشكلة اللي `useExisting` بيحلها: لو عندك `CartService` (الـsingleton الحقيقي بتاع حالة الكارت)، وعايز بعض الأماكن تتعامل مع abstraction اسمه `CartFacade` (عشان decoupling، أو لأن جزء قديم في الكود متعمول على التوكن القديم)، فلازم التوكنين يشيروا لنفس الـinstance، مش يتعملهم نسختين منفصلتين بحالة كارت مختلفة كل واحدة.

```ts
// cart.facade.ts
export abstract class CartFacade {
  abstract readonly items$: Observable<CartItem[]>;
  abstract add(item: CartItem): void;
}

// cart.service.ts
@Injectable({ providedIn: 'root' })
export class CartService implements CartFacade {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();
  add(item: CartItem) { /* ... */ }
}

// app.config.ts
providers: [
  CartService,
  { provide: CartFacade, useExisting: CartService }, // نفس الـinstance بالضبط
]
```

**الفرق العملي (جرّبه بنفسك يوم 6 عشان تشوف الباج):** لو كتبت `{ provide: CartFacade, useExisting: CartService }` فعلاً، أي component يحقن `CartFacade` هيشوف بالضبط نفس عناصر الكارت اللي حد تاني ضافها عبر `CartService` مباشرة. لكن لو غيّرتها لـ `{ provide: CartFacade, useClass: CartService }` — Angular هيعمل **instance ثانية كاملة** من `CartService` (بـ `BehaviorSubject` خاص بيها)، فهتلاقي الكارت "فاضي" لو فتحته من مكان بيحقن `CartFacade` بعد ما ضفت منتج من مكان بيحقن `CartService` مباشرة. ده بالضبط الفرق بين الاتنين، وأفضل طريقة تفهمه هي إنك تشوف الباج بعينك ساعة بتغيّرها.

> ملاحظة لما تقول للتيم ليدر إنك خلصت النقطة: `useClass`/`useExisting` هي provider configurations أساسية (مش senior بالضرورة)، لكن اللي فعلًا senior هو اللي جنبهم في الـroadmap: multi-providers (`multi: true`) و factory providers (`useFactory`) — دول خطوة بعد كده لو حابب تتعمق أكتر.

---

## Mock Backend — تجهيز سريع (json-server)

```bash
npm install -g json-server   # أو npx بدون تثبيت global
npx json-server mock-server/db.json --port 3000
```

`db.json` لازم يحتوي على: `products`, `categories`, `orders`, `users` (بـ role: customer/admin). للـauth، أبسط حل: route صغير فوق json-server (`server.js`) بيتحقق من username/password في `users` ويرجّع توكن مبني على `btoa(JSON.stringify({ sub, role, exp }))` — مش JWT حقيقي، لكنه كافي عشان تطبّق Interceptors وGuards وRBAC بمنطق حقيقي.

---

## نقاط مستبعدة عمدًا من الـ10 أيام (Senior-level — مرحلة جاية)

Nx/monorepos/micro-frontends · Web Workers · SSO/OAuth2 enterprise حقيقي (هنا توكن mock بس) · Advanced DI (multi-providers, factory providers) · CI/CD pipeline كامل + cloud deployment · E2E testing · Animations متقدمة · a11y audit كامل · Security hardening عميق (XSS/CSRF) — Angular بيـsanitize تلقائي وده كافي دلوقتي.

دول مش "حاجات هتفوتك" — دول طبيعي يكونوا بعد ما تخلص Junior بالكامل وتدخل في Mid عمليًا، مش في sprint تعلّم 10 أيام.

---

## طقس آخر اليوم (يقتل إحساس "بدأت عشوائي")

في آخر كل يوم: (1) commit بالصيغة المتفق عليها فوق، (2) سطر واحد بالروادماب items اللي اتلمسوا النهاردة، (3) سطر واحد "بكرة هبدأ بـ...". لو حسيت إنك بتتوه وسط اليوم، رجّع لجدول اليوم ده — لو مش موجود فيه، سيبه لبكرة.
